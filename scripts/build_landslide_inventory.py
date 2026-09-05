import os
import io
import subprocess
import requests
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import numpy as np

boundary_file = r"D:\ILSM\ne_boundary.geojson"
prob_raster_file = r"D:\SIH26002-NER-Smart-Logistics\data\susceptibility\ILSM_NE_probability.tif"
class_raster_file = r"D:\SIH26002-NER-Smart-Logistics\data\susceptibility\ILSM_NE_class.tif"
out_dir = r"D:\SIH26002-NER-Smart-Logistics\data\landslide_inventory"
os.makedirs(out_dir, exist_ok=True)

out_geojson = os.path.join(out_dir, "landslides_NE_India.geojson")
out_csv = os.path.join(out_dir, "landslides_NE_India.csv")

print("1. Loading Northeast boundary polygon...")
ne_boundary = gpd.read_file(boundary_file)
minx, miny, maxx, maxy = ne_boundary.total_bounds

unified_records = []

# ==========================================
# SOURCE 1: NASA Global Landslide Catalog (GLC)
# ==========================================
print("2. Downloading and processing NASA Global Landslide Catalog (GLC)...")
nasa_url = "https://raw.githubusercontent.com/abhaychaudhary18/Global-Landslide-Data-Analysis-using-Python/main/Global_Landslide_Catalog_Export.csv"
try:
    r_nasa = requests.get(nasa_url, timeout=30)
    if r_nasa.status_code == 200:
        df_nasa = pd.read_csv(io.BytesIO(r_nasa.content))
        df_nasa_clean = df_nasa.dropna(subset=["latitude", "longitude"]).copy()
        df_nasa_clean["latitude"] = pd.to_numeric(df_nasa_clean["latitude"], errors="coerce")
        df_nasa_clean["longitude"] = pd.to_numeric(df_nasa_clean["longitude"], errors="coerce")
        
        mask_bbox = (df_nasa_clean["longitude"] >= minx) & (df_nasa_clean["longitude"] <= maxx) & \
                    (df_nasa_clean["latitude"] >= miny) & (df_nasa_clean["latitude"] <= maxy)
        df_nasa_ne = df_nasa_clean[mask_bbox].copy()
        
        for idx, row in df_nasa_ne.iterrows():
            unified_records.append({
                "event_id": f"NASA_GLC_{row.get('event_id', idx)}",
                "source": "NASA_GLC",
                "event_title": str(row.get("event_title", "Landslide Event")),
                "event_date": str(row.get("event_date", "Unknown")),
                "state": str(row.get("admin_division_name", "Northeast India")),
                "location_description": str(row.get("location_description", "")),
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "landslide_category": str(row.get("landslide_category", "Landslide")),
                "landslide_trigger": str(row.get("landslide_trigger", "Rainfall")),
                "fatalities": int(row["fatality_count"]) if pd.notna(row.get("fatality_count")) else 0,
                "injuries": int(row["injury_count"]) if pd.notna(row.get("injury_count")) else 0,
            })
except Exception as e:
    print(f"   Error fetching NASA GLC: {e}")

# ==========================================
# SOURCE 2: Sikkim Multi-temporal Inventory
# ==========================================
print("3. Downloading and processing Sikkim Multi-Temporal Inventory (Zenodo)...")
sikkim_shp_url = "https://zenodo.org/api/records/8169506/files/Google_Earth_landslides_point_21Dec2021.shp/content"
sikkim_shx_url = "https://zenodo.org/api/records/8169506/files/Google_Earth_landslides_point_21Dec2021.shx/content"
sikkim_dbf_url = "https://zenodo.org/api/records/8169506/files/Google_Earth_landslides_point_21Dec2021.dbf/content"
sikkim_prj_url = "https://zenodo.org/api/records/8169506/files/Google_Earth_landslides_point_21Dec2021.prj/content"

temp_sikkim_dir = os.path.join(out_dir, "temp_sikkim")
os.makedirs(temp_sikkim_dir, exist_ok=True)

try:
    with open(os.path.join(temp_sikkim_dir, "sikkim.shp"), "wb") as f:
        f.write(requests.get(sikkim_shp_url, timeout=15).content)
    with open(os.path.join(temp_sikkim_dir, "sikkim.shx"), "wb") as f:
        f.write(requests.get(sikkim_shx_url, timeout=15).content)
    with open(os.path.join(temp_sikkim_dir, "sikkim.dbf"), "wb") as f:
        f.write(requests.get(sikkim_dbf_url, timeout=15).content)
    with open(os.path.join(temp_sikkim_dir, "sikkim.prj"), "wb") as f:
        f.write(requests.get(sikkim_prj_url, timeout=15).content)
        
    gdf_sikkim = gpd.read_file(os.path.join(temp_sikkim_dir, "sikkim.shp"))
    if gdf_sikkim.crs != "EPSG:4326":
        gdf_sikkim = gdf_sikkim.to_crs("EPSG:4326")
    
    for idx, row in gdf_sikkim.iterrows():
        pt = row.geometry
        unified_records.append({
            "event_id": f"SIKKIM_INV_{idx+1:04d}",
            "source": "Sikkim_State_Inventory",
            "event_title": f"Sikkim {row.get('Name', 'Landslide')} - {row.get('Extent', 'Basin')}",
            "event_date": str(row.get("descriptio", "Historical Inventory")),
            "state": "Sikkim",
            "location_description": f"{row.get('Extent', '')} - Geology: {row.get('Geology', '')}",
            "latitude": float(pt.y),
            "longitude": float(pt.x),
            "landslide_category": str(row.get("Name", "Debris flow")),
            "landslide_trigger": "Monsoon Rainfall / Slope Instability",
            "fatalities": 0,
            "injuries": 0,
        })
except Exception as e:
    print(f"   Error fetching Sikkim inventory: {e}")

# ==========================================
# SOURCE 3: Mizoram Inventory
# ==========================================
print("4. Downloading and processing Mizoram Inventory (Zenodo)...")
mizoram_url = "https://zenodo.org/api/records/20783995/files/Aizawl_Landslide_Inventory_2015_2025.xlsx/content"
try:
    r_miz = requests.get(mizoram_url, timeout=15)
    if r_miz.status_code == 200:
        df_miz = pd.read_excel(io.BytesIO(r_miz.content))
        lat_col = [c for c in df_miz.columns if "lat" in c.lower()][0]
        lon_col = [c for c in df_miz.columns if "lon" in c.lower() or "long" in c.lower()][0]
        
        df_miz_clean = df_miz.dropna(subset=[lat_col, lon_col]).copy()
        
        for idx, row in df_miz_clean.iterrows():
            unified_records.append({
                "event_id": f"MIZORAM_INV_{idx+1:03d}",
                "source": "Mizoram_State_Inventory",
                "event_title": f"Mizoram Landslide: {row.get('Location', 'Aizawl')}",
                "event_date": str(row.get("Date", "Unknown")),
                "state": "Mizoram",
                "location_description": str(row.get("Impact Summary", row.get("Location", ""))),
                "latitude": float(row[lat_col]),
                "longitude": float(row[lon_col]),
                "landslide_category": str(row.get("Landslide Type", "Translational Slide")),
                "landslide_trigger": "Heavy Monsoon Downpour",
                "fatalities": int(row["Fatalities"]) if pd.notna(row.get("Fatalities")) and str(row.get("Fatalities")).isdigit() else 0,
                "injuries": 0,
            })
except Exception as e:
    print(f"   Error fetching Mizoram inventory: {e}")

# ==========================================
# SPATIAL SAMPLING OF SUSCEPTIBILITY LAYERS
# ==========================================
print(f"5. Total compiled landslide records: {len(unified_records)}")
df_unified = pd.DataFrame(unified_records)
geometry = [Point(xy) for xy in zip(df_unified["longitude"], df_unified["latitude"])]
gdf_unified = gpd.GeoDataFrame(df_unified, geometry=geometry, crs="EPSG:4326")

# Point-in-polygon verification
ne_union = ne_boundary.union_all()
gdf_unified["inside_ne_polygon"] = gdf_unified.geometry.apply(lambda p: bool(ne_union.contains(p) or ne_union.touches(p)))

# Fast batch query via gdallocationinfo
print("6. Cross-validating points against ILSM Susceptibility layers via gdallocationinfo...")
coords_stdin = "\n".join([f"{x} {y}" for x, y in zip(gdf_unified.longitude, gdf_unified.latitude)])

# Query Probability
res_prob = subprocess.run(
    ["gdallocationinfo", "-valonly", "-geoloc", prob_raster_file],
    input=coords_stdin,
    capture_output=True,
    text=True
)
prob_lines = res_prob.stdout.strip().splitlines()

# Query Class
res_class = subprocess.run(
    ["gdallocationinfo", "-valonly", "-geoloc", class_raster_file],
    input=coords_stdin,
    capture_output=True,
    text=True
)
class_lines = res_class.stdout.strip().splitlines()

class_map = {1: "Very Low (0-20%)", 2: "Low (20-40%)", 3: "Moderate (40-60%)", 4: "High (60-80%)", 5: "Very High (80-100%)"}

probs = []
classes = []
class_names = []

for i in range(len(gdf_unified)):
    # Parse prob
    p_str = prob_lines[i].strip() if i < len(prob_lines) else ""
    try:
        p_val = float(p_str)
        p_clean = round(p_val, 4) if np.isfinite(p_val) else None
    except ValueError:
        p_clean = None
        
    # Parse class
    c_str = class_lines[i].strip() if i < len(class_lines) else ""
    try:
        c_val = int(c_str)
        c_clean = c_val if c_val > 0 else None
        c_name = class_map.get(c_clean, "Unclassified") if c_clean else "Unclassified"
    except ValueError:
        c_clean, c_name = None, "Unclassified"
        
    probs.append(p_clean)
    classes.append(c_clean)
    class_names.append(c_name)

gdf_unified["susceptibility_probability"] = probs
gdf_unified["susceptibility_class_num"] = classes
gdf_unified["susceptibility_class_name"] = class_names

# Clean ascii for safe output
for col in gdf_unified.columns:
    if gdf_unified[col].dtype == "object":
        gdf_unified[col] = gdf_unified[col].astype(str)

gdf_save = gdf_unified.copy()
gdf_save.to_file(out_geojson, driver="GeoJSON")
df_csv = pd.DataFrame(gdf_save.drop(columns=["geometry"]))
df_csv.to_csv(out_csv, index=False, encoding="utf-8")

# Cleanup temp
import shutil
if os.path.exists(temp_sikkim_dir):
    shutil.rmtree(temp_sikkim_dir)

print("\n" + "=" * 60)
print("LANDSLIDE INVENTORY PIPELINE COMPLETED SUCCESSFULLY!")
print("=" * 60)
print(f"Total Northeast Landslide Occurrences: {len(gdf_unified)}")
print(f"Saved GeoJSON: {out_geojson} ({os.path.getsize(out_geojson)/1024:.1f} KB)")
print(f"Saved CSV:     {out_csv} ({os.path.getsize(out_csv)/1024:.1f} KB)")

print("\nSusceptibility Distribution of Historical Events:")
for c_name, count in gdf_unified["susceptibility_class_name"].value_counts().items():
    pct = (count / len(gdf_unified)) * 100
    print(f"  - {c_name:<25}: {count:>4} events ({pct:>5.1f}%)")
print("=" * 60)
