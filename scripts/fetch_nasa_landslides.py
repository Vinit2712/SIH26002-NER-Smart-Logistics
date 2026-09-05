import requests
import json
import os
import geopandas as gpd
import pandas as pd
from shapely.geometry import Point

url = "https://maps.nccs.nasa.gov/server/rest/services/global_landslide_catalog/glc_viewer_service/FeatureServer/0/query"
boundary_file = r"D:\ILSM\ne_boundary.geojson"
out_dir = r"D:\SIH26002-NER-Smart-Logistics\data\landslide_inventory"
os.makedirs(out_dir, exist_ok=True)

out_geojson = os.path.join(out_dir, "landslides_NE_India.geojson")
out_csv = os.path.join(out_dir, "landslides_NE_India.csv")

print("Querying NASA Global Landslide Catalog (COOLR)...")
params = {
    "where": "country_name = 'India'",
    "outFields": "*",
    "f": "json",
    "returnGeometry": "true",
    "resultRecordCount": 2000
}

try:
    r = requests.get(url, params=params, timeout=30)
    print("Status code:", r.status_code)

    if r.status_code == 200:
        data = r.json()
        features = data.get("features", [])
        print(f"Total India landslide records fetched from NASA: {len(features)}")
        
        records = []
        for f in features:
            attrs = f.get("attributes", {})
            geom = f.get("geometry", {})
            x = geom.get("x")
            y = geom.get("y")
            if x is not None and y is not None:
                attrs["longitude"] = float(x)
                attrs["latitude"] = float(y)
                attrs["geometry"] = Point(float(x), float(y))
                records.append(attrs)
                
        gdf_all = gpd.GeoDataFrame(records, crs="EPSG:4326")
        print(f"Valid geometry records: {len(gdf_all)}")
        
        ne_boundary = gpd.read_file(boundary_file)
        minx, miny, maxx, maxy = ne_boundary.total_bounds
        
        # Filter by NE bounds and boundary polygon
        gdf_ne = gdf_all[(gdf_all.longitude >= minx) & (gdf_all.longitude <= maxx) & 
                         (gdf_all.latitude >= miny) & (gdf_all.latitude <= maxy)].copy()
        print(f"Landslides in Northeast India region: {len(gdf_ne)}")
        
        if len(gdf_ne) > 0:
            print("\nSample NE Landslide Events:")
            sample_cols = [c for c in ["event_id", "event_title", "event_date", "landslide_category", "landslide_trigger", "fatalities", "state_name", "latitude", "longitude"] if c in gdf_ne.columns]
            print(gdf_ne[sample_cols].head(5).to_string())
            
            # Format timestamp columns for geojson
            gdf_save = gdf_ne.copy()
            for col in gdf_save.columns:
                if "date" in col.lower() or "time" in col.lower():
                    gdf_save[col] = gdf_save[col].astype(str)
            
            gdf_save.to_file(out_geojson, driver="GeoJSON")
            df_csv = pd.DataFrame(gdf_save.drop(columns=["geometry"]))
            df_csv.to_csv(out_csv, index=False)
            
            print("\n" + "=" * 60)
            print("LANDSLIDE INVENTORY DATASET CREATED SUCCESSFULLY!")
            print("=" * 60)
            print(f"1. GeoJSON: {out_geojson} ({len(gdf_ne)} events)")
            print(f"2. CSV:     {out_csv}")
            print("=" * 60)
        else:
            print("No features found in bounding box.")
    else:
        print("API error:", r.text[:300])
except Exception as e:
    print("Error querying NASA API:", e)
