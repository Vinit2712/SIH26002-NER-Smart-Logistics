"""
RiskRoute — Risk Model Training (v2, matched to real schema)
================================================================
Reads features/segment_features.parquet from 01_build_feature_table_v2.py,
builds the label, trains XGBoost, evaluates, exports segment_id/risk_score/risk_level.

LABEL DEFINITION (documented, not hidden)
------------------------------------------
risk_label = 1 if segment has >=1 historical landslide (from the 869-event
             inventory) within the proximity buffer used in feature building,
             else 0.

We deliberately do NOT use `active_incident_nearby_count` in the label — that
comes from a live snapshot (8 rows, today's active incidents), not historical
evidence, and using "is there currently an incident here" as ground truth for
"is this segment risky" would be circular once the model runs on live data
later. It IS included as a training feature though? No — also excluded from
features for the same leakage reason (it wasn't present when older landslide
events happened; it would look highly predictive purely because it's temporally
downstream of the label construction). Route it into the LIVE risk-adjustment
layer later (backend can just add "+incident nearby" as an on-top rule), not
into the trained model.

`nearby_landslide_max_fatalities` is EXCLUDED from features — it is derived
directly from the same landslide points that define the label, so including
it would leak the label into the features almost 1:1.

HOW TO RUN
----------
1. pip install pandas numpy scikit-learn xgboost --break-system-packages
2. python 02_train_risk_model.py
3. Output:
     model/risk_model.json
     output/segment_risk_scores.csv   (segment_id, risk_score, risk_level)
"""

import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report
import xgboost as xgb

FEATURES_PATH = "features/segment_features.parquet"
MODEL_DIR = "model"
OUTPUT_DIR = "output"
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

FEATURE_COLS = [
    "elevation",
    "slope",
    "aspect",
    "landslide_susceptibility_prob",
    "landslide_susceptibility_class",
    "annual_normal_mm",
    "monsoon_daily_mean_mm",
    "moderate_threshold_24h_mm",
    "high_threshold_24h_mm",
    "extreme_threshold_24h_mm",
]


def build_label(df):
    df = df.copy()
    df["risk_label"] = (df["nearby_landslide_count"].fillna(0) > 0).astype(int)
    return df


def main():
    print("Loading feature table...")
    df = pd.read_parquet(FEATURES_PATH)
    df = build_label(df)

    print(f"Label distribution:\n{df['risk_label'].value_counts()}")
    pos_rate = df["risk_label"].mean()
    print(f"Positive rate: {pos_rate:.4f}")
    if df["risk_label"].nunique() < 2:
        print("WARNING: only one class present. Increase the proximity buffer "
              "in 01_build_feature_table_v2.py or check landslide lat/lon "
              "actually overlap the road network's extent.")

    df = df.dropna(subset=FEATURE_COLS, how="all")
    X = df[FEATURE_COLS].fillna(df[FEATURE_COLS].median())
    y = df["risk_label"]

    stratify = y if y.nunique() > 1 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=stratify
    )

    print("Training XGBoost baseline...")
    # scale_pos_weight helps since landslide-adjacent segments will be a small
    # minority out of 286k total segments
    n_pos = max(y_train.sum(), 1)
    n_neg = len(y_train) - n_pos
    scale_pos_weight = n_neg / n_pos

    model = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        scale_pos_weight=scale_pos_weight,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= 0.5).astype(int)

    if y_test.nunique() > 1:
        print(f"\nTest AUC: {roc_auc_score(y_test, y_pred_proba):.3f}")
    print("\nClassification report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    print("\nFeature importance:")
    print(pd.Series(model.feature_importances_, index=FEATURE_COLS).sort_values(ascending=False))

    print("\nScoring all segments...")
    all_scores = model.predict_proba(X)[:, 1]
    df["risk_score"] = all_scores

    # Fixed 0.33/0.66 cutoffs assume scores spread across 0-1, but with a ~2%
    # positive base rate the scores bunch near the low end — fixed cutoffs
    # would classify almost everything as "low" and make the tiering useless.
    # Quantile-based bins guarantee meaningful high/medium/low groups instead.
    print("\nrisk_score percentiles:")
    print(df["risk_score"].describe(percentiles=[0.5, 0.75, 0.90, 0.95, 0.99]))

    high_cutoff = df["risk_score"].quantile(0.90)
    medium_cutoff = df["risk_score"].quantile(0.70)
    df["risk_level"] = np.select(
        [df["risk_score"] >= high_cutoff, df["risk_score"] >= medium_cutoff],
        ["high", "medium"],
        default="low",
    )
    print(f"\nrisk_level cutoffs used: high >= {high_cutoff:.4f}, medium >= {medium_cutoff:.4f}")
    print(df["risk_level"].value_counts())

    result = df[["segment_id", "risk_score", "risk_level"]]
    out_path = os.path.join(OUTPUT_DIR, "segment_risk_scores.csv")
    result.to_csv(out_path, index=False)
    print(f"Saved: {out_path}")

    model_path = os.path.join(MODEL_DIR, "risk_model.json")
    model.save_model(model_path)
    print(f"Saved: {model_path}")


if __name__ == "__main__":
    main()
