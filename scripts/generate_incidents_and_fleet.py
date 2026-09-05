import os
import json
import random
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from datetime import datetime, timezone, timedelta

# Setup output folders
incidents_dir = r"D:\SIH26002-NER-Smart-Logistics\data\incidents"
fleet_dir = r"D:\SIH26002-NER-Smart-Logistics\data\fleet"
os.makedirs(incidents_dir, exist_ok=True)
os.makedirs(fleet_dir, exist_ok=True)

out_incidents_geojson = os.path.join(incidents_dir, "ner_road_incidents.geojson")
out_incidents_csv = os.path.join(incidents_dir, "ner_road_incidents.csv")
out_fleet_profiles_json = os.path.join(fleet_dir, "vehicle_fleet_profiles.json")
out_shipments_geojson = os.path.join(fleet_dir, "supplier_shipments.geojson")
out_shipments_csv = os.path.join(fleet_dir, "supplier_shipments.csv")

now = datetime.now(timezone.utc)

# =========================================================================
# 1. REALISTIC INCIDENTS & DISRUPTIONS (SNAPPED TO REAL HIGHWAY CORRIDORS)
# =========================================================================
INCIDENTS_DATA = [
    {
        "incident_id": "INC_NER_2026_001",
        "title": "Major Landslide Blockage on NH-29",
        "incident_type": "LANDSLIDE_BLOCKAGE",
        "severity": "CRITICAL",
        "status": "ACTIVE",
        "state": "Nagaland",
        "corridor": "NH-29 (Dimapur - Kohima Highway)",
        "location_name": "Dzüdza Bridge stretch near Sechü Zubza",
        "latitude": 25.7142,
        "longitude": 94.0285,
        "nearest_osm_ref": "NH29",
        "passable_for": "NONE",
        "estimated_clearance_time_hrs": 6.5,
        "delay_penalty_minutes": 390,
        "reporting_agency": "Border Roads Organisation (BRO / Project Sewak)",
        "description": "Massive rockfall and debris flow completely blocked both carriageways. Earthmovers deployed for clearance.",
        "reported_time": (now - timedelta(hours=2, minutes=15)).isoformat()
    },
    {
        "incident_id": "INC_NER_2026_002",
        "title": "Road Subsidance & Sinking Zone on NH-10",
        "incident_type": "ROAD_COLLAPSE_EROSION",
        "severity": "HIGH",
        "status": "ACTIVE",
        "state": "Sikkim",
        "corridor": "NH-10 (Siliguri - Gangtok Lifeline)",
        "location_name": "Selfie Dara near Rangpo Border",
        "latitude": 27.1850,
        "longitude": 88.5250,
        "nearest_osm_ref": "NH10",
        "passable_for": "LIGHT_VEHICLES_ONLY",
        "estimated_clearance_time_hrs": 4.0,
        "delay_penalty_minutes": 180,
        "reporting_agency": "Sikkim PWD / Traffic Police",
        "description": "Road formation washed away along Teesta river bank. Heavy multi-axle trucks strictly diverted via Lava-Algarah route.",
        "reported_time": (now - timedelta(hours=4, minutes=40)).isoformat()
    },
    {
        "incident_id": "INC_NER_2026_003",
        "title": "Flash Flood Waterlogging on NH-37 (Barak Valley)",
        "incident_type": "WATERLOGGING_FLOOD",
        "severity": "HIGH",
        "status": "ACTIVE",
        "state": "Assam",
        "corridor": "NH-37 (Silchar - Jiribam Highway)",
        "location_name": "Phulertal Low-lying Stretch near Jiribam Border",
        "latitude": 24.7920,
        "longitude": 93.0850,
        "nearest_osm_ref": "NH37",
        "passable_for": "HEAVY_AND_4X4_ONLY",
        "estimated_clearance_time_hrs": 3.0,
        "delay_penalty_minutes": 120,
        "reporting_agency": "Assam State Disaster Management Authority (ASDMA)",
        "description": "2.5 feet water overflow over highway culvert due to Jiri river swelling. Small vehicles cannot pass.",
        "reported_time": (now - timedelta(hours=1, minutes=10)).isoformat()
    },
    {
        "incident_id": "INC_NER_2026_004",
        "title": "Bridge Deck Structural Maintenance on NH-306",
        "incident_type": "BRIDGE_MAINTENANCE",
        "severity": "MODERATE",
        "status": "CLEARING_IN_PROGRESS",
        "state": "Mizoram",
        "corridor": "NH-306 (Kolasib - Sairang Corridor)",
        "location_name": "Chhimtuipui Bridge approach near Bilkhawthlir",
        "latitude": 24.3120,
        "longitude": 92.7050,
        "nearest_osm_ref": "NH306",
        "passable_for": "SINGLE_LANE_ALTERNATING",
        "estimated_clearance_time_hrs": 2.0,
        "delay_penalty_minutes": 45,
        "reporting_agency": "NHIDCL",
        "description": "Expansion joint maintenance in progress. One-way traffic piloted alternatively with 30-min holding queues.",
        "reported_time": (now - timedelta(hours=5, minutes=0)).isoformat()
    },
    {
        "incident_id": "INC_NER_2026_005",
        "title": "Debris & Mud Sludge on Sela Pass Road (NH-13)",
        "incident_type": "MUDSLIDE_SLOWDOWN",
        "severity": "HIGH",
        "status": "ACTIVE",
        "state": "Arunachal Pradesh",
        "corridor": "NH-13 (Bhalukpong - Tawang Axis)",
        "location_name": "Between Jaswant Garh and Sela Tunnel approach",
        "latitude": 27.5120,
        "longitude": 92.0950,
        "nearest_osm_ref": "NH13",
        "passable_for": "4X4_AND_CHAINS_ONLY",
        "estimated_clearance_time_hrs": 5.0,
        "delay_penalty_minutes": 210,
        "reporting_agency": "Border Roads Organisation (Project Vartak)",
        "description": "Continuous rainfall triggered slurry mudslide across 150m road length. 4x4 wheel drive required.",
        "reported_time": (now - timedelta(hours=3, minutes=30)).isoformat()
    },
    {
        "incident_id": "INC_NER_2026_006",
        "title": "Hill Cutting & Slope Failure on Dima Hasao Ghat",
        "incident_type": "LANDSLIDE_BLOCKAGE",
        "severity": "CRITICAL",
        "status": "ACTIVE",
        "state": "Assam",
        "corridor": "NH-27 (Lumding - Haflong - Silchar Corridor)",
        "location_name": "Jatinga Ghat section near Mahur",
        "latitude": 25.1950,
        "longitude": 93.1120,
        "nearest_osm_ref": "NH27",
        "passable_for": "NONE",
        "estimated_clearance_time_hrs": 8.0,
        "delay_penalty_minutes": 480,
        "reporting_agency": "NHAI / Dima Hasao District Administration",
        "description": "Unstable hill mass slipped onto 4-lane expressway under construction. Highway closed for all transit.",
        "reported_time": (now - timedelta(hours=6, minutes=20)).isoformat()
    },
    {
        "incident_id": "INC_NER_2026_007",
        "title": "Inner Line Permit & Heavy Freight Checkpost Congestion",
        "incident_type": "BORDER_CHECKPOST_CONGESTION",
        "severity": "LOW",
        "status": "ACTIVE",
        "state": "Mizoram",
        "corridor": "Vairengte Border Entry Point",
        "location_name": "Vairengte ILP Checkpost (Assam-Mizoram Border)",
        "latitude": 24.5120,
        "longitude": 92.7560,
        "nearest_osm_ref": "NH306",
        "passable_for": "ALL_WITH_CAUTION",
        "estimated_clearance_time_hrs": 1.5,
        "delay_penalty_minutes": 35,
        "reporting_agency": "Mizoram Police & Transport Dept",
        "description": "Commercial cargo barcode verification queue extending 1.2 km on Assam side.",
        "reported_time": (now - timedelta(hours=1, minutes=45)).isoformat()
    },
    {
        "incident_id": "INC_NER_2026_008",
        "title": "Bridge Scouring near Mangan (North Sikkim)",
        "incident_type": "ROAD_COLLAPSE_EROSION",
        "severity": "CRITICAL",
        "status": "ACTIVE",
        "state": "Sikkim",
        "corridor": "North Sikkim Highway (Dikchu - Mangan)",
        "location_name": "Sankalang Bridge Replacement Bailey Section",
        "latitude": 27.5300,
        "longitude": 88.5400,
        "nearest_osm_ref": "North Sikkim Hwy",
        "passable_for": "NONE",
        "estimated_clearance_time_hrs": 12.0,
        "delay_penalty_minutes": 720,
        "reporting_agency": "Border Roads Organisation (Project Swastik)",
        "description": "Flash water discharge in Kanaka river damaged bridge abutment. North Sikkim route completely severed.",
        "reported_time": (now - timedelta(hours=7, minutes=10)).isoformat()
    }
]

# Save Incidents
df_incidents = pd.DataFrame(INCIDENTS_DATA)
geom_inc = [Point(xy) for xy in zip(df_incidents["longitude"], df_incidents["latitude"])]
gdf_inc = gpd.GeoDataFrame(df_incidents, geometry=geom_inc, crs="EPSG:4326")

gdf_inc.to_file(out_incidents_geojson, driver="GeoJSON")
df_incidents.to_csv(out_incidents_csv, index=False, encoding="utf-8")

# =========================================================================
# 2. VEHICLE FLEET PROFILES (SPECS & RISK TOLERANCES)
# =========================================================================
FLEET_PROFILES = {
    "HEAVY_CARGO_TRUCK": {
        "class_name": "Heavy Multi-Axle Freight Truck (16-Wheeler)",
        "payload_capacity_tons": 25.0,
        "base_plains_speed_kmh": 55,
        "base_hills_speed_kmh": 28,
        "max_slope_gradient_pct": 12.0,
        "max_wind_speed_kmh": 45,
        "rain_slowdown_factor": 0.35,
        "risk_tolerance_threshold": 0.45,
        "eligible_for_restricted_bridges": False,
        "description": "Standard heavy long-haul logistics truck. Strictly avoids steep slopes >12% and critical landslide roads."
    },
    "MEDIUM_COMMERCIAL_VEHICLE": {
        "class_name": "Medium Commercial Truck (Eicher / Tata 6-Wheeler)",
        "payload_capacity_tons": 9.5,
        "base_plains_speed_kmh": 65,
        "base_hills_speed_kmh": 36,
        "max_slope_gradient_pct": 18.0,
        "max_wind_speed_kmh": 55,
        "rain_slowdown_factor": 0.25,
        "risk_tolerance_threshold": 0.65,
        "eligible_for_restricted_bridges": True,
        "description": "Primary regional distribution vehicle. Agile on mountain switchbacks, moderate slope resistance."
    },
    "LIGHT_4X4_SUPPLY_PICKUP": {
        "class_name": "Light 4x4 All-Terrain Utility (Mahindra Bolero / Isuzu 4WD)",
        "payload_capacity_tons": 2.2,
        "base_plains_speed_kmh": 75,
        "base_hills_speed_kmh": 48,
        "max_slope_gradient_pct": 28.0,
        "max_wind_speed_kmh": 70,
        "rain_slowdown_factor": 0.15,
        "risk_tolerance_threshold": 0.85,
        "eligible_for_restricted_bridges": True,
        "description": "Last-mile mountain lifeline vehicle. Can navigate mild mudslides, unpaved cuts, and steep slopes."
    },
    "EMERGENCY_DISASTER_RELIEF_VAN": {
        "class_name": "Priority Emergency Relief & Medical Transport",
        "payload_capacity_tons": 1.5,
        "base_plains_speed_kmh": 85,
        "base_hills_speed_kmh": 55,
        "max_slope_gradient_pct": 25.0,
        "max_wind_speed_kmh": 65,
        "rain_slowdown_factor": 0.10,
        "risk_tolerance_threshold": 0.90,
        "eligible_for_restricted_bridges": True,
        "description": "Priority emergency cargo (medicines, rescue gear). Highest speed priority, authorized for restricted passes."
    }
}

with open(out_fleet_profiles_json, "w", encoding="utf-8") as f:
    json.dump(FLEET_PROFILES, f, indent=2)

# =========================================================================
# 3. SAMPLE SUPPLIER SHIPMENTS & LOGISTICS ORDERS (DEMO SCENARIOS)
# =========================================================================
SHIPMENTS_DATA = [
    {
        "shipment_id": "SHP_NER_101",
        "origin_hub": "Guwahati Central Logistics Park",
        "origin_state": "Assam",
        "origin_lat": 26.1158,
        "origin_lon": 91.7086,
        "destination_hub": "Tawang Army & Civil Supply Depot",
        "destination_state": "Arunachal Pradesh",
        "destination_lat": 27.5861,
        "destination_lon": 91.8653,
        "cargo_type": "Cold-Chain Pharmaceuticals & Emergency Rations",
        "cargo_weight_tons": 2.0,
        "priority": "CRITICAL",
        "assigned_vehicle_type": "LIGHT_4X4_SUPPLY_PICKUP",
        "scheduled_departure": now.isoformat(),
        "ideal_eta_hours": 11.5,
        "key_risk_corridors": "Bhalukpong-Bomdila-Sela Pass (NH-13)"
    },
    {
        "shipment_id": "SHP_NER_102",
        "origin_hub": "Silchar Transshipment Depot",
        "origin_state": "Assam",
        "origin_lat": 24.8333,
        "origin_lon": 92.7789,
        "destination_hub": "Aizawl FCI Supply Warehouse",
        "destination_state": "Mizoram",
        "destination_lat": 23.7307,
        "destination_lon": 92.7173,
        "cargo_type": "Essential Foodgrains & Commodities (FCI)",
        "cargo_weight_tons": 18.5,
        "priority": "HIGH",
        "assigned_vehicle_type": "HEAVY_CARGO_TRUCK",
        "scheduled_departure": (now + timedelta(hours=1)).isoformat(),
        "ideal_eta_hours": 6.0,
        "key_risk_corridors": "Vairengte-Kolasib-Sairang (NH-306)"
    },
    {
        "shipment_id": "SHP_NER_103",
        "origin_hub": "Dimapur Railway Freight Terminal",
        "origin_state": "Nagaland",
        "origin_lat": 25.9068,
        "origin_lon": 93.7274,
        "destination_hub": "Imphal Regional Distribution Hub",
        "destination_state": "Manipur",
        "destination_lat": 24.8170,
        "destination_lon": 93.9368,
        "cargo_type": "Infrastructure Construction & Telecom Hardware",
        "cargo_weight_tons": 8.0,
        "priority": "MEDIUM",
        "assigned_vehicle_type": "MEDIUM_COMMERCIAL_VEHICLE",
        "scheduled_departure": (now + timedelta(hours=2)).isoformat(),
        "ideal_eta_hours": 5.5,
        "key_risk_corridors": "Kohima-Senapati-Imphal (NH-2 / NH-29)"
    },
    {
        "shipment_id": "SHP_NER_104",
        "origin_hub": "Siliguri Integrated Logistics Yard",
        "origin_state": "West Bengal",
        "origin_lat": 26.7271,
        "origin_lon": 88.3953,
        "destination_hub": "Gangtok State Food & Drug Depot",
        "destination_state": "Sikkim",
        "destination_lat": 27.3389,
        "destination_lon": 88.6065,
        "cargo_type": "Perishable Dairy & Hospital Oxygen Cylinders",
        "cargo_weight_tons": 4.5,
        "priority": "CRITICAL",
        "assigned_vehicle_type": "MEDIUM_COMMERCIAL_VEHICLE",
        "scheduled_departure": now.isoformat(),
        "ideal_eta_hours": 4.2,
        "key_risk_corridors": "Sevoke-Coronation Bridge-Rangpo (NH-10)"
    }
]

df_shipments = pd.DataFrame(SHIPMENTS_DATA)
geom_ship = [Point(xy) for xy in zip(df_shipments["origin_lon"], df_shipments["origin_lat"])]
gdf_shipments = gpd.GeoDataFrame(df_shipments, geometry=geom_ship, crs="EPSG:4326")

gdf_shipments.to_file(out_shipments_geojson, driver="GeoJSON")
df_shipments.to_csv(out_shipments_csv, index=False, encoding="utf-8")

print("=" * 60)
print("INCIDENTS, DISRUPTIONS & FLEET PIPELINE COMPLETED SUCCESSFULLY!")
print("=" * 60)
print(f"1. Road Incidents GeoJSON: {out_incidents_geojson} ({len(INCIDENTS_DATA)} events)")
print(f"2. Road Incidents CSV:     {out_incidents_csv}")
print(f"3. Fleet Profiles JSON:    {out_fleet_profiles_json} ({len(FLEET_PROFILES)} vehicle types)")
print(f"4. Supplier Shipments:     {out_shipments_geojson} ({len(SHIPMENTS_DATA)} demo routes)")
print("=" * 60)
