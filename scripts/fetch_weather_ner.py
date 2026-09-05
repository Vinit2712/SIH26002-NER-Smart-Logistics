import os
import json
import time
import requests
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from datetime import datetime, timezone

out_dir = r"D:\SIH26002-NER-Smart-Logistics\data\weather"
os.makedirs(out_dir, exist_ok=True)

# Output paths
out_live_geojson = os.path.join(out_dir, "ner_live_weather_snapshot.geojson")
out_live_csv = os.path.join(out_dir, "ner_live_weather_snapshot.csv")
out_grid_geojson = os.path.join(out_dir, "ner_weather_monitoring_grid.geojson")
out_baseline_csv = os.path.join(out_dir, "ner_rainfall_baseline.csv")
out_baseline_json = os.path.join(out_dir, "ner_rainfall_baseline.json")

STATIONS = [
    # ASSAM
    {"id": "NER_AS_01", "name": "Guwahati", "state": "Assam", "lat": 26.1445, "lon": 91.7362, "corridor": "NH-27 / Hub", "elevation_m": 55},
    {"id": "NER_AS_02", "name": "Silchar", "state": "Assam", "lat": 24.8333, "lon": 92.7789, "corridor": "Barak Valley / NH-37", "elevation_m": 25},
    {"id": "NER_AS_03", "name": "Dibrugarh", "state": "Assam", "lat": 27.4728, "lon": 94.9120, "corridor": "Upper Assam / NH-15", "elevation_m": 108},
    {"id": "NER_AS_04", "name": "Tezpur", "state": "Assam", "lat": 26.6528, "lon": 92.7926, "corridor": "North Bank / NH-15", "elevation_m": 48},
    {"id": "NER_AS_05", "name": "Jorhat", "state": "Assam", "lat": 26.7509, "lon": 94.2037, "corridor": "Central Assam / NH-715", "elevation_m": 116},
    {"id": "NER_AS_06", "name": "Haflong", "state": "Assam", "lat": 25.1764, "lon": 93.0183, "corridor": "Dima Hasao Hill Highway / NH-27", "elevation_m": 968},
    {"id": "NER_AS_07", "name": "Bongaigaon", "state": "Assam", "lat": 26.5024, "lon": 90.5532, "corridor": "Lower Assam / NH-27", "elevation_m": 54},
    {"id": "NER_AS_08", "name": "Diphu", "state": "Assam", "lat": 25.8436, "lon": 93.4312, "corridor": "Karbi Anglong / NH-329", "elevation_m": 186},

    # ARUNACHAL PRADESH
    {"id": "NER_AR_01", "name": "Itanagar", "state": "Arunachal Pradesh", "lat": 27.0844, "lon": 93.6053, "corridor": "Capital / NH-415", "elevation_m": 320},
    {"id": "NER_AR_02", "name": "Tawang", "state": "Arunachal Pradesh", "lat": 27.5861, "lon": 91.8653, "corridor": "Sela Pass Corridor / NH-13", "elevation_m": 3048},
    {"id": "NER_AR_03", "name": "Bomdila", "state": "Arunachal Pradesh", "lat": 27.2645, "lon": 92.4208, "corridor": "West Kameng / NH-13", "elevation_m": 2217},
    {"id": "NER_AR_04", "name": "Pasighat", "state": "Arunachal Pradesh", "lat": 28.0664, "lon": 95.3267, "corridor": "Siang Valley / NH-515", "elevation_m": 153},
    {"id": "NER_AR_05", "name": "Ziro", "state": "Arunachal Pradesh", "lat": 27.5450, "lon": 93.8340, "corridor": "Subansiri / NH-13", "elevation_m": 1572},
    {"id": "NER_AR_06", "name": "Tezu", "state": "Arunachal Pradesh", "lat": 27.9167, "lon": 96.1667, "corridor": "Lohit / NH-13", "elevation_m": 210},
    {"id": "NER_AR_07", "name": "Aalo (Along)", "state": "Arunachal Pradesh", "lat": 28.1694, "lon": 94.8028, "corridor": "West Siang / Trans-Arunachal", "elevation_m": 619},

    # MEGHALAYA
    {"id": "NER_ML_01", "name": "Shillong", "state": "Meghalaya", "lat": 25.5788, "lon": 91.8933, "corridor": "Khasi Hills / NH-6", "elevation_m": 1525},
    {"id": "NER_ML_02", "name": "Cherrapunji (Sohra)", "state": "Meghalaya", "lat": 25.2700, "lon": 91.7300, "corridor": "Heavy Rain Zone / SH-5", "elevation_m": 1484},
    {"id": "NER_ML_03", "name": "Jowai", "state": "Meghalaya", "lat": 25.4464, "lon": 92.1994, "corridor": "Jaintia Hills / NH-6", "elevation_m": 1380},
    {"id": "NER_ML_04", "name": "Tura", "state": "Meghalaya", "lat": 25.5144, "lon": 90.2032, "corridor": "Garo Hills / NH-217", "elevation_m": 349},
    {"id": "NER_ML_05", "name": "Nongstoin", "state": "Meghalaya", "lat": 25.5167, "lon": 91.2667, "corridor": "West Khasi / NH-106", "elevation_m": 1409},

    # MANIPUR
    {"id": "NER_MN_01", "name": "Imphal", "state": "Manipur", "lat": 24.8170, "lon": 93.9368, "corridor": "Imphal Valley / NH-2", "elevation_m": 786},
    {"id": "NER_MN_02", "name": "Senapati", "state": "Manipur", "lat": 25.2681, "lon": 94.0203, "corridor": "Kohima-Imphal Lifeline / NH-2", "elevation_m": 1050},
    {"id": "NER_MN_03", "name": "Tamenglong", "state": "Manipur", "lat": 24.9856, "lon": 93.4939, "corridor": "High Landslide Zone / NH-37", "elevation_m": 1260},
    {"id": "NER_MN_04", "name": "Churachandpur", "state": "Manipur", "lat": 24.3333, "lon": 93.6833, "corridor": "South Manipur / NH-102B", "elevation_m": 922},
    {"id": "NER_MN_05", "name": "Ukhrul", "state": "Manipur", "lat": 25.1167, "lon": 94.3667, "corridor": "East Manipur / NH-202", "elevation_m": 1662},
    {"id": "NER_MN_06", "name": "Jiribam", "state": "Manipur", "lat": 24.8000, "lon": 93.1200, "corridor": "Assam-Manipur Border / NH-37", "elevation_m": 30},

    # MIZORAM
    {"id": "NER_MZ_01", "name": "Aizawl", "state": "Mizoram", "lat": 23.7307, "lon": 92.7173, "corridor": "Capital / NH-306", "elevation_m": 1132},
    {"id": "NER_MZ_02", "name": "Lunglei", "state": "Mizoram", "lat": 22.8833, "lon": 92.7333, "corridor": "South Mizoram / NH-54", "elevation_m": 722},
    {"id": "NER_MZ_03", "name": "Kolasib", "state": "Mizoram", "lat": 24.2300, "lon": 92.6800, "corridor": "Silchar-Aizawl Lifeline / NH-306", "elevation_m": 612},
    {"id": "NER_MZ_04", "name": "Champhai", "state": "Mizoram", "lat": 23.4756, "lon": 93.3283, "corridor": "Border Trade Corridor / NH-102B", "elevation_m": 1334},
    {"id": "NER_MZ_05", "name": "Serchhip", "state": "Mizoram", "lat": 23.3411, "lon": 92.8500, "corridor": "Central Mizoram / NH-54", "elevation_m": 880},

    # NAGALAND
    {"id": "NER_NL_01", "name": "Kohima", "state": "Nagaland", "lat": 25.6701, "lon": 94.1077, "corridor": "Capital Highway / NH-29", "elevation_m": 1444},
    {"id": "NER_NL_02", "name": "Dimapur", "state": "Nagaland", "lat": 25.9068, "lon": 93.7274, "corridor": "Logistics Gateway / NH-29", "elevation_m": 145},
    {"id": "NER_NL_03", "name": "Mokokchung", "state": "Nagaland", "lat": 26.3253, "lon": 94.5150, "corridor": "Central Nagaland / NH-2", "elevation_m": 1325},
    {"id": "NER_NL_04", "name": "Wokha", "state": "Nagaland", "lat": 26.1000, "lon": 94.2667, "corridor": "Mid Hills / NH-2", "elevation_m": 1313},
    {"id": "NER_NL_05", "name": "Mon", "state": "Nagaland", "lat": 26.7500, "lon": 95.0333, "corridor": "North Nagaland / NH-702", "elevation_m": 897},
    {"id": "NER_NL_06", "name": "Phek", "state": "Nagaland", "lat": 25.6833, "lon": 94.5000, "corridor": "East Hills / NH-202", "elevation_m": 1450},

    # SIKKIM
    {"id": "NER_SK_01", "name": "Gangtok", "state": "Sikkim", "lat": 27.3389, "lon": 88.6065, "corridor": "Capital / NH-10", "elevation_m": 1650},
    {"id": "NER_SK_02", "name": "Namchi", "state": "Sikkim", "lat": 27.1667, "lon": 88.3500, "corridor": "South Sikkim / SH-2", "elevation_m": 1315},
    {"id": "NER_SK_03", "name": "Mangan", "state": "Sikkim", "lat": 27.5167, "lon": 88.5333, "corridor": "North Sikkim Highway (High Risk)", "elevation_m": 956},
    {"id": "NER_SK_04", "name": "Gyalshing", "state": "Sikkim", "lat": 27.2833, "lon": 88.2500, "corridor": "West Sikkim / SH-3", "elevation_m": 1600},
    {"id": "NER_SK_05", "name": "Rangpo", "state": "Sikkim", "lat": 27.1772, "lon": 88.5311, "corridor": "WB-Sikkim Gateway / NH-10", "elevation_m": 330},

    # TRIPURA
    {"id": "NER_TR_01", "name": "Agartala", "state": "Tripura", "lat": 23.8315, "lon": 91.2868, "corridor": "Capital / NH-8", "elevation_m": 12},
    {"id": "NER_TR_02", "name": "Dharmanagar", "state": "Tripura", "lat": 24.3833, "lon": 92.1667, "corridor": "North Tripura / NH-8", "elevation_m": 21},
    {"id": "NER_TR_03", "name": "Udaipur", "state": "Tripura", "lat": 23.5333, "lon": 91.4833, "corridor": "South Tripura / NH-8", "elevation_m": 19},
    {"id": "NER_TR_04", "name": "Ambassa", "state": "Tripura", "lat": 23.9167, "lon": 91.8500, "corridor": "Dhalai / NH-8", "elevation_m": 60}
]

print("=" * 60)
print(f"FETCHING LIVE WEATHER ACROSS {len(STATIONS)} NORTHEAST NODES...")
print("=" * 60)

live_records = []
now_iso = datetime.now(timezone.utc).isoformat()

session = requests.Session()

for idx, st in enumerate(STATIONS, 1):
    lat = st["lat"]
    lon = st["lon"]
    name = st["name"]
    state = st["state"]
    
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m",
        "hourly": "precipitation",
        "past_days": 3,
        "forecast_days": 1
    }
    
    success = False
    for attempt in range(3):
        try:
            r = session.get(url, params=params, timeout=25)
            if r.status_code == 200:
                data = r.json()
                curr = data.get("current", {})
                hourly = data.get("hourly", {}).get("precipitation", [])
                
                r24 = sum(hourly[48:72]) if len(hourly) >= 72 else 0.0
                r48_24 = sum(hourly[24:48]) if len(hourly) >= 48 else 0.0
                r72_48 = sum(hourly[0:24]) if len(hourly) >= 24 else 0.0
                r72_total = r24 + r48_24 + r72_48
                forecast_24h = sum(hourly[72:96]) if len(hourly) >= 96 else 0.0
                
                # Antecedent Rainfall Index (ARI)
                ari = r24 + (0.5 * r48_24) + (0.25 * r72_48)
                
                temp = curr.get("temperature_2m", 25.0)
                humidity = curr.get("relative_humidity_2m", 80)
                precip_rate = curr.get("precipitation", 0.0)
                wind_spd = curr.get("wind_speed_10m", 5.0)
                w_code = curr.get("weather_code", 0)
                
                if ari >= 75.0 or r24 >= 60.0 or precip_rate >= 15.0:
                    hazard_level = "CRITICAL"
                    risk_multiplier = 2.5
                elif ari >= 40.0 or r24 >= 35.0 or precip_rate >= 7.5:
                    hazard_level = "HIGH"
                    risk_multiplier = 1.8
                elif ari >= 15.0 or r24 >= 15.0 or precip_rate >= 2.5:
                    hazard_level = "MODERATE"
                    risk_multiplier = 1.3
                else:
                    hazard_level = "NORMAL"
                    risk_multiplier = 1.0
                    
                rec = {
                    "station_id": st["id"],
                    "name": name,
                    "state": state,
                    "corridor": st["corridor"],
                    "elevation_m": st["elevation_m"],
                    "latitude": lat,
                    "longitude": lon,
                    "timestamp": now_iso,
                    "temperature_c": round(temp, 1),
                    "relative_humidity_pct": humidity,
                    "current_precip_rate_mm_hr": round(precip_rate, 2),
                    "wind_speed_kmh": round(wind_spd, 1),
                    "weather_code": w_code,
                    "past_24h_rainfall_mm": round(r24, 2),
                    "past_48h_rainfall_mm": round(r24 + r48_24, 2),
                    "past_72h_rainfall_mm": round(r72_total, 2),
                    "forecast_next_24h_mm": round(forecast_24h, 2),
                    "antecedent_rainfall_index": round(ari, 2),
                    "rainfall_hazard_level": hazard_level,
                    "dynamic_risk_multiplier": risk_multiplier,
                }
                live_records.append(rec)
                print(f"[{idx:02d}/{len(STATIONS)}] {name:<16} ({state:<17}) -> 72h Rain: {r72_total:>5.1f}mm | ARI: {ari:>5.1f} | Level: {hazard_level}")
                success = True
                break
            else:
                time.sleep(1)
        except Exception:
            time.sleep(1.5)
            
    if not success:
        print(f"[{idx:02d}/{len(STATIONS)}] {name} failed after 3 attempts.")

# Save Live Snapshot
df_live = pd.DataFrame(live_records)
geometry = [Point(xy) for xy in zip(df_live["longitude"], df_live["latitude"])]
gdf_live = gpd.GeoDataFrame(df_live, geometry=geometry, crs="EPSG:4326")

gdf_live.to_file(out_live_geojson, driver="GeoJSON")
df_live.to_csv(out_live_csv, index=False, encoding="utf-8")

# Save Monitoring Station Network Grid (Static reference)
df_grid = pd.DataFrame(STATIONS)
geom_grid = [Point(xy) for xy in zip(df_grid["lon"], df_grid["lat"])]
gdf_grid = gpd.GeoDataFrame(df_grid, geometry=geom_grid, crs="EPSG:4326")
gdf_grid.to_file(out_grid_geojson, driver="GeoJSON")

# 2. DISTRICT & CORRIDOR MONSOON RAINFALL BASELINES
BASELINES = [
    {"state": "Meghalaya", "region": "Khasi & Jaintia Hills", "annual_normal_mm": 2818, "monsoon_daily_mean_mm": 18.5, "moderate_threshold_24h_mm": 35.0, "high_threshold_24h_mm": 65.0, "extreme_threshold_24h_mm": 120.0},
    {"state": "Assam", "region": "Dima Hasao & Karbi Anglong", "annual_normal_mm": 1780, "monsoon_daily_mean_mm": 12.0, "moderate_threshold_24h_mm": 25.0, "high_threshold_24h_mm": 50.0, "extreme_threshold_24h_mm": 90.0},
    {"state": "Assam", "region": "Brahmaputra Valley", "annual_normal_mm": 1950, "monsoon_daily_mean_mm": 14.2, "moderate_threshold_24h_mm": 30.0, "high_threshold_24h_mm": 55.0, "extreme_threshold_24h_mm": 100.0},
    {"state": "Arunachal Pradesh", "region": "West Kameng & Tawang", "annual_normal_mm": 2100, "monsoon_daily_mean_mm": 15.0, "moderate_threshold_24h_mm": 30.0, "high_threshold_24h_mm": 60.0, "extreme_threshold_24h_mm": 110.0},
    {"state": "Arunachal Pradesh", "region": "Siang & Lohit Valleys", "annual_normal_mm": 3200, "monsoon_daily_mean_mm": 22.0, "moderate_threshold_24h_mm": 40.0, "high_threshold_24h_mm": 75.0, "extreme_threshold_24h_mm": 135.0},
    {"state": "Sikkim", "region": "East & North Sikkim", "annual_normal_mm": 2739, "monsoon_daily_mean_mm": 19.8, "moderate_threshold_24h_mm": 35.0, "high_threshold_24h_mm": 70.0, "extreme_threshold_24h_mm": 125.0},
    {"state": "Manipur", "region": "Senapati & Tamenglong", "annual_normal_mm": 1600, "monsoon_daily_mean_mm": 11.5, "moderate_threshold_24h_mm": 25.0, "high_threshold_24h_mm": 50.0, "extreme_threshold_24h_mm": 85.0},
    {"state": "Mizoram", "region": "Aizawl & Kolasib Ridges", "annual_normal_mm": 2150, "monsoon_daily_mean_mm": 16.0, "moderate_threshold_24h_mm": 30.0, "high_threshold_24h_mm": 60.0, "extreme_threshold_24h_mm": 105.0},
    {"state": "Nagaland", "region": "Kohima & Mokokchung", "annual_normal_mm": 1800, "monsoon_daily_mean_mm": 13.0, "moderate_threshold_24h_mm": 25.0, "high_threshold_24h_mm": 50.0, "extreme_threshold_24h_mm": 90.0},
    {"state": "Tripura", "region": "Dhalai & North Tripura", "annual_normal_mm": 2200, "monsoon_daily_mean_mm": 15.5, "moderate_threshold_24h_mm": 30.0, "high_threshold_24h_mm": 55.0, "extreme_threshold_24h_mm": 95.0}
]

df_baseline = pd.DataFrame(BASELINES)
df_baseline.to_csv(out_baseline_csv, index=False, encoding="utf-8")

with open(out_baseline_json, "w", encoding="utf-8") as f:
    json.dump(BASELINES, f, indent=2)

print("\n" + "=" * 60)
print(f"WEATHER PIPELINE COMPLETED: {len(df_live)} / {len(STATIONS)} STATIONS POPULATED!")
print("=" * 60)
print(f"1. Live Snapshot GeoJSON: {out_live_geojson} ({os.path.getsize(out_live_geojson)/1024:.1f} KB)")
print(f"2. Live Snapshot CSV:     {out_live_csv} ({os.path.getsize(out_live_csv)/1024:.1f} KB)")
print(f"3. Monitoring Grid:       {out_grid_geojson} ({os.path.getsize(out_grid_geojson)/1024:.1f} KB)")
print(f"4. Rainfall Baselines:    {out_baseline_csv}")
print("=" * 60)
