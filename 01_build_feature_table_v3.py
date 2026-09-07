"""
RiskRoute — Feature Engineering (v3: adds rainfall)
======================================================
Same as v2, plus rainfall features joined via nearest weather-monitoring
station.

RAINFALL JOIN — HOW IT WORKS (documented, not hidden)
------------------------------------------------------
ner_rainfall_baseline.csv is indexed by (state, region) — 10 rows total.
ner_weather_monitoring_grid.geojson has 47 stations with `state` but no
`region` field, so region must be assigned first.

8 of 10 states have exactly ONE region row -> every station in that state
gets that region automatically, no ambiguity.

Assam and Arunachal Pradesh each have TWO region rows. For those, station ->
region is assigned below using each station's corridor name / rough
longitude, because the raw data doesn't disambiguate this for us. This is a
documented approximation for the prototype:
  - Assam: "Dima Hasao & Karbi Anglong" (hill stations: Haflong, Diphu) vs
    "Brahmaputra Valley" (everything else, including Silchar/Barak Valley,
    which isn't covered by either baseline region — assigned to
    Brahmaputra Valley as the closer of the two available categories).
  - Arunachal Pradesh: "West Kameng & Tawang" (Tawang, Bomdila) vs
    "Siang & Lohit Valleys" (Pasighat, Tezu, Aalo, and — as an approximation
    based on longitude — Itanagar and Ziro, which sit between the two
    named districts).

Once a region is assigned to every station, each road segment gets the
rainfall values of its NEAREST station (spatial nearest join, not a loop).

HOW TO RUN
----------
1. pip install geopandas rasterio shapely pandas numpy --break-system-packages
   (geopandas >= 0.10 needed for sjoin_nearest)
2. python 01_build_feature_table_v3.py
3. Output: features/segment_features.parquet / .csv
"""

import os
import time
import numpy as np
import pandas as pd
import geopandas as gpd
import rasterio
from shapely.geometry import Point

DATA_DIR = "data"
PROCESSED_DIR = "processed"

ROADS_GPKG = os.path.join(PROCESSED_DIR, "ne_roads_routing.gpkg")

DEM_TIF = os.path.join(DATA_DIR, "terrain", "DEM_NE_India.tif")
SLOPE_TIF = os.path.join(DATA_DIR, "terrain", "slope.tif")
ASPECT_TIF = os.path.join(DATA_DIR, "terrain", "aspect.tif")
ILSM_PROB_TIF = os.path.join(DATA_DIR, "susceptibility", "ILSM_NE_probability.tif")
ILSM_CLASS_TIF = os.path.join(DATA_DIR, "susceptibility", "ILSM_NE_class.tif")

LANDSLIDES_CSV = os.path.join(DATA_DIR, "landslide_inventory", "landslides_NE_India.csv")
INCIDENTS_CSV = os.path.join(DATA_DIR, "incidents", "ner_road_incidents.csv")
RAINFALL_CSV = os.path.join(DATA_DIR, "weather", "ner_rainfall_baseline.csv")
WEATHER_GRID_GEOJSON = os.path.join(DATA_DIR, "weather", "ner_weather_monitoring_grid.geojson")

SAMPLES_PER_SEGMENT = 5
PROXIMITY_BUFFER_M_LANDSLIDE = 500
PROXIMITY_BUFFER_M_INCIDENT = 2000
PROJECTED_CRS = "EPSG:32646"  # approximation, see note in v2

OUTPUT_DIR = "features"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ----------------------------------------------------------------------------
# Station -> rainfall region mapping (only needed for multi-region states)
# ----------------------------------------------------------------------------
STATION_REGION_OVERRIDE = {
    # Assam
    "NER_AS_06": "Dima Hasao & Karbi Anglong",   # Haflong
    "NER_AS_08": "Dima Hasao & Karbi Anglong",   # Diphu
    # everything else Assam -> Brahmaputra Valley (handled by default below)

    # Arunachal Pradesh
    "NER_AR_02": "West Kameng & Tawang",         # Tawang
    "NER_AR_03": "West Kameng & Tawang",         # Bomdila
    "NER_AR_04": "Siang & Lohit Valleys",        # Pasighat
    "NER_AR_06": "Siang & Lohit Valleys",        # Tezu
    "NER_AR_07": "Siang & Lohit Valleys",        # Aalo
    "NER_AR_01": "Siang & Lohit Valleys",        # Itanagar (approximation)
    "NER_AR_05": "Siang & Lohit Valleys",        # Ziro (approximation)
}
DEFAULT_REGION_BY_STATE = {
    "Assam": "Brahmaputra Valley",
    "Arunachal Pradesh": "Siang & Lohit Valleys",
    # single-region states resolve automatically via the merge below
}


def batch_sample_raster(raster_path, coords_wgs84):
    with rasterio.open(raster_path) as src:
        nodata = src.nodata
        values = np.array([v[0] for v in src.sample(coords_wgs84)], dtype=float)
        if nodata is not None:
            values[values == nodata] = np.nan
    return values


def build_station_rainfall_table():
    """Assign each weather station its rainfall region, then attach the
    numeric rainfall columns from ner_rainfall_baseline.csv."""
    stations = gpd.read_file(WEATHER_GRID_GEOJSON)
    rainfall = pd.read_csv(RAINFALL_CSV)

    def assign_region(row):
        if row["id"] in STATION_REGION_OVERRIDE:
            return STATION_REGION_OVERRIDE[row["id"]]
        if row["state"] in DEFAULT_REGION_BY_STATE:
            return DEFAULT_REGION_BY_STATE[row["state"]]
        # single-region states: just take the (only) region for that state
        match = rainfall.loc[rainfall["state"] == row["state"], "region"]
        return match.iloc[0] if len(match) else None

    stations["region"] = stations.apply(assign_region, axis=1)
    stations = stations.merge(rainfall, on=["state", "region"], how="left")
    missing = stations["annual_normal_mm"].isna().sum()
    if missing:
        print(f"WARNING: {missing} stations could not be matched to a rainfall region.")
    return stations


def main():
    t0 = time.time()
    print("Loading road network...")
    roads = gpd.read_file(ROADS_GPKG)
    roads["segment_id"] = roads["osm_id"].astype(str)
    print(f"Loaded {len(roads)} road segments.")

    roads_wgs84 = roads if roads.crs.to_epsg() == 4326 else roads.to_crs(epsg=4326)
    roads_m = roads.to_crs(PROJECTED_CRS)

    # ---- terrain sampling (same as v2) ----
    print("Building sample points along each segment...")
    all_coords, seg_ids_per_point = [], []
    for seg_id, geom in zip(roads_wgs84["segment_id"], roads_wgs84.geometry):
        if geom is None or geom.is_empty:
            continue
        for d in np.linspace(0, geom.length, SAMPLES_PER_SEGMENT):
            p = geom.interpolate(d)
            all_coords.append((p.x, p.y))
            seg_ids_per_point.append(seg_id)
    print(f"Total sample points: {len(all_coords)}")

    print("Sampling terrain + susceptibility rasters...")
    points_df = pd.DataFrame({
        "segment_id": seg_ids_per_point,
        "elevation": batch_sample_raster(DEM_TIF, all_coords),
        "slope": batch_sample_raster(SLOPE_TIF, all_coords),
        "aspect": batch_sample_raster(ASPECT_TIF, all_coords),
        "landslide_susceptibility_prob": batch_sample_raster(ILSM_PROB_TIF, all_coords),
        "landslide_susceptibility_class": batch_sample_raster(ILSM_CLASS_TIF, all_coords),
    })
    terrain_df = points_df.groupby("segment_id", as_index=False).mean(numeric_only=True)

    # ---- historical landslide proximity ----
    print("Historical landslide spatial join...")
    landslides = pd.read_csv(LANDSLIDES_CSV)
    landslides_gdf = gpd.GeoDataFrame(
        landslides,
        geometry=[Point(xy) for xy in zip(landslides["longitude"], landslides["latitude"])],
        crs="EPSG:4326",
    ).to_crs(PROJECTED_CRS)
    roads_buf_ls = roads_m[["segment_id", "geometry"]].copy()
    roads_buf_ls["geometry"] = roads_buf_ls.geometry.buffer(PROXIMITY_BUFFER_M_LANDSLIDE)
    joined_ls = gpd.sjoin(landslides_gdf, roads_buf_ls, predicate="within", how="inner")
    landslide_counts = joined_ls.groupby("segment_id").size().rename("nearby_landslide_count")
    fatality_by_seg = joined_ls.groupby("segment_id")["fatalities"].max().rename("nearby_landslide_max_fatalities")

    # ---- live incidents (feature only, not label) ----
    print("Live incident spatial join...")
    incidents = pd.read_csv(INCIDENTS_CSV)
    incidents_gdf = gpd.GeoDataFrame(
        incidents,
        geometry=[Point(xy) for xy in zip(incidents["longitude"], incidents["latitude"])],
        crs="EPSG:4326",
    ).to_crs(PROJECTED_CRS)
    roads_buf_inc = roads_m[["segment_id", "geometry"]].copy()
    roads_buf_inc["geometry"] = roads_buf_inc.geometry.buffer(PROXIMITY_BUFFER_M_INCIDENT)
    joined_inc = gpd.sjoin(incidents_gdf, roads_buf_inc, predicate="within", how="inner")
    incident_flag = joined_inc.groupby("segment_id").size().rename("active_incident_nearby_count")

    # ---- rainfall via nearest station ----
    print("Building station rainfall table...")
    stations = build_station_rainfall_table()
    stations_m = stations.to_crs(PROJECTED_CRS)

    print("Nearest-station join for rainfall (this is a single vectorized nearest-neighbor query)...")
    roads_points_m = roads_m[["segment_id", "geometry"]].copy()
    roads_points_m["geometry"] = roads_points_m.geometry.centroid  # segment midpoint approximation
    rainfall_cols = ["annual_normal_mm", "monsoon_daily_mean_mm", "moderate_threshold_24h_mm",
                      "high_threshold_24h_mm", "extreme_threshold_24h_mm"]
    nearest = gpd.sjoin_nearest(
        roads_points_m, stations_m[["geometry"] + rainfall_cols],
        how="left", distance_col="dist_to_station_m"
    )
    rainfall_by_seg = nearest[["segment_id"] + rainfall_cols].drop_duplicates(subset="segment_id")

    # ---- merge everything ----
    feature_table = roads_m[["segment_id"]].drop_duplicates()
    feature_table = feature_table.merge(terrain_df, on="segment_id", how="left")
    feature_table = feature_table.merge(landslide_counts, on="segment_id", how="left")
    feature_table = feature_table.merge(fatality_by_seg, on="segment_id", how="left")
    feature_table = feature_table.merge(incident_flag, on="segment_id", how="left")
    feature_table = feature_table.merge(rainfall_by_seg, on="segment_id", how="left")

    feature_table["nearby_landslide_count"] = feature_table["nearby_landslide_count"].fillna(0)
    feature_table["nearby_landslide_max_fatalities"] = feature_table["nearby_landslide_max_fatalities"].fillna(0)
    feature_table["active_incident_nearby_count"] = feature_table["active_incident_nearby_count"].fillna(0)

    print(f"\nFinal feature table: {feature_table.shape[0]} rows, {feature_table.shape[1]} columns")
    print(feature_table.head())
    print(f"Segments with >=1 nearby historical landslide: {(feature_table['nearby_landslide_count'] > 0).sum()}")
    print(f"Segments missing rainfall data: {feature_table['annual_normal_mm'].isna().sum()}")

    out_parquet = os.path.join(OUTPUT_DIR, "segment_features.parquet")
    out_csv = os.path.join(OUTPUT_DIR, "segment_features.csv")
    feature_table.to_parquet(out_parquet, index=False)
    feature_table.to_csv(out_csv, index=False)
    print(f"\nSaved: {out_parquet}\nSaved: {out_csv}\nTotal time: {time.time()-t0:.1f}s")


if __name__ == "__main__":
    main()
