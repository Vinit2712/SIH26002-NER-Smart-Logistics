"""
RiskRoute — Sanity Check: do known-risky highways actually score high?
=========================================================================
Joins output/segment_risk_scores.csv back to the road network's name/ref
columns and prints the highest-risk segments per named highway. A model
that doesn't flag NH-10 (Sikkim) or NH-29 (Nagaland) as elevated risk,
given they're in your incidents/landslide narrative, would be a red flag
worth investigating before handing this off to routing.

HOW TO RUN
----------
python check_known_highways.py
"""

import pandas as pd
import geopandas as gpd

roads = gpd.read_file("processed/ne_roads_routing.gpkg")
roads["segment_id"] = roads["osm_id"].astype(str)

scores = pd.read_csv("output/segment_risk_scores.csv")
scores["segment_id"] = scores["segment_id"].astype(str)

merged = roads[["segment_id", "name", "ref", "road_type"]].merge(scores, on="segment_id", how="inner")

import re

WATCH_REFS = ["NH10", "NH29", "NH37", "NH13"]  # from the incidents/demo narrative

# Word-boundary match — "NH10" must not match "NH102A" or "NH137" must not match "NH13".
# ref fields can hold multiple refs separated by "; " (e.g. "NH2; NH29"), so split first.
def ref_matches(ref_value, target):
    if pd.isna(ref_value):
        return False
    parts = [r.strip() for r in str(ref_value).split(";")]
    return target in parts

for ref in WATCH_REFS:
    mask = merged["ref"].apply(lambda v: ref_matches(v, ref))
    subset = merged[mask]
    if subset.empty:
        print(f"{ref}: no exact-match segments found")
        continue
    print(f"\n{ref} — {len(subset)} segments, "
          f"mean risk_score={subset['risk_score'].mean():.3f}, "
          f"% high={100*(subset['risk_level']=='high').mean():.1f}%")
    print(subset.sort_values("risk_score", ascending=False).head(5)[
        ["name", "ref", "risk_score", "risk_level"]
    ].to_string(index=False))

print("\nTop 10 highest-risk MAJOR roads (trunk/primary/secondary only):")
major = merged[merged["road_type"].isin(["trunk", "primary", "secondary"])]
print(major.sort_values("risk_score", ascending=False).head(10)[
    ["name", "ref", "road_type", "risk_score", "risk_level"]
].to_string(index=False))

print("\n(For reference) Top 10 highest-risk segments network-wide, any road_type:")
print(merged.sort_values("risk_score", ascending=False).head(10)[
    ["name", "ref", "road_type", "risk_score", "risk_level"]
].to_string(index=False))
