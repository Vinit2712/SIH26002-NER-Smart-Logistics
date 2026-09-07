"""
RiskRoute — Schema Inspector
=============================
Prints the exact column names (and a few sample rows) for the files the
feature-engineering and training scripts depend on. Run this once, share the
output, and the CHECK/EDIT placeholders in 01_build_feature_table.py and
02_train_risk_model.py get filled in with real values instead of guesses.

HOW TO RUN
----------
1. Place this file in your riskroute-data repo root (same level as data/, processed/).
2. pip install pandas geopandas --break-system-packages   (if not already installed)
3. python inspect_columns.py
4. Copy-paste the full console output back into the chat.
"""

import pandas as pd
import geopandas as gpd

def show_csv(path, label, n=3):
    print(f"\n{'='*70}\n{label}: {path}\n{'='*70}")
    try:
        df = pd.read_csv(path)
        print(f"Columns: {list(df.columns)}")
        print(f"Row count: {len(df)}")
        print(df.head(n).to_string())
    except Exception as e:
        print(f"Could not read: {e}")


def show_gpkg(path, label, n=3):
    print(f"\n{'='*70}\n{label}: {path}\n{'='*70}")
    try:
        layers = gpd.list_layers(path)
        print(f"Layers: {layers}")
        gdf = gpd.read_file(path)
        print(f"Columns: {list(gdf.columns)}")
        print(f"CRS: {gdf.crs}")
        print(f"Row count: {len(gdf)}")
        print(gdf.drop(columns="geometry").head(n).to_string())
    except Exception as e:
        print(f"Could not read: {e}")


def show_geojson(path, label, n=3):
    print(f"\n{'='*70}\n{label}: {path}\n{'='*70}")
    try:
        gdf = gpd.read_file(path)
        print(f"Columns: {list(gdf.columns)}")
        print(f"Geometry type(s): {gdf.geom_type.unique()}")
        print(f"CRS: {gdf.crs}")
        print(f"Row count: {len(gdf)}")
        print(gdf.drop(columns="geometry").head(n).to_string())
    except Exception as e:
        print(f"Could not read: {e}")


if __name__ == "__main__":
    # Already inspected in the first pass — re-run is harmless/fast:
    show_csv("data/landslide_inventory/landslides_NE_India.csv", "LANDSLIDE INVENTORY")
    show_csv("data/incidents/ner_road_incidents.csv", "ROAD INCIDENTS")
    show_csv("data/weather/ner_rainfall_baseline.csv", "RAINFALL BASELINE", n=10)
    show_gpkg("processed/ne_roads_routing.gpkg", "ROAD NETWORK (routing)")

    # NEW — needed to figure out the rainfall spatial join:
    show_geojson("data/weather/ner_weather_monitoring_grid.geojson", "WEATHER MONITORING GRID")
    show_csv("data/weather/ner_live_weather_snapshot.csv", "LIVE WEATHER SNAPSHOT")
