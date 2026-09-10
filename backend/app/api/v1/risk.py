from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from typing import List, Optional
from pydantic import BaseModel
from app.db.session import get_db
from app.db.models import User
from app.db.models import RoadSegment, Incident, WeatherSnapshot
from app.db.models.incident import IncidentStatus, IncidentSeverity
from app.core.security import get_current_active_user
from app.services.ml_service import MLService
import json
from datetime import datetime, timedelta

router = APIRouter()

class RiskResponse(BaseModel):
    id: int
    roadId: int
    level: str  # low, medium, high, critical
    cause: str
    predictedAt: Optional[str] = None  # ISO timestamp
    mlConfidence: Optional[float] = None  # Confidence of ML prediction if used

    class Config:
        orm_mode = True

@router.get("/", response_model=List[RiskResponse])
async def get_risk_assessment(
    limit: int = Query(100, description="Maximum number of segments to return"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Get road segments
    segments_query = select(RoadSegment.id, RoadSegment.name).limit(limit)
    segments_result = await db.execute(segments_query)
    segments = segments_result.all()

    # Initialize ML service
    ml_service = MLService()

    risk_assessments = []

    for segment in segments:
        segment_id, segment_name = segment

        # Calculate risk based on incidents in the last 24 hours
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)

        # Count active verified incidents (not resolved) in the last 24 hours
        incident_query = (
            select(func.count(Incident.id))
            .where(
                Incident.segment_id == segment_id,
                Incident.status == IncidentStatus.VERIFIED.value,
                Incident.resolved_at.is_(None),
                Incident.reported_at >= twenty_four_hours_ago
            )
        )
        incident_result = await db.execute(incident_query)
        recent_incident_count = incident_result.scalar_one()

        # Get severity breakdown for more detailed risk assessment
        severity_query = (
            select(Incident.severity, func.count(Incident.id))
            .where(
                Incident.segment_id == segment_id,
                Incident.status == IncidentStatus.VERIFIED.value,
                Incident.resolved_at.is_(None),
                Incident.reported_at >= twenty_four_hours_ago
            )
            .group_by(Incident.severity)
        )
        severity_result = await db.execute(severity_query)
        severity_counts = dict(severity_result.all())

        # Calculate risk based on weather
        # Get the latest weather snapshot for this segment
        weather_query = (
            select(WeatherSnapshot)
            .where(WeatherSnapshot.segment_id == segment_id)
            .order_by(desc(WeatherSnapshot.recorded_at))
            .limit(1)
        )
        weather_result = await db.execute(weather_query)
        latest_weather = weather_result.scalar_one_or_none()

        # Prepare external data for ML prediction
        external_data = {}
        if latest_weather:
            external_data = {
                'temperature': latest_weather.temperature,
                'precipitation': latest_weather.rainfall,
                'wind_speed': latest_weather.wind_speed,
                'visibility': latest_weather.visibility,
                # Add default values for other features that the ML model expects
                'elevation': 0.0,  # Default - would ideally come from GIS data
                'slope': 0.0,      # Default - would ideally come from GIS data
                'aspect': 0.0,     # Default - would ideally come from GIS data
                'landslide_susceptibility_prob': 0.1,  # Default low probability
                'landslide_susceptibility_class': 1.0, # Default low susceptibility
                'annual_normal_mm': 1000.0,  # Default moderate annual rainfall
                'monsoon_daily_mean_mm': 20.0, # Default moderate monsoon rainfall
                'moderate_threshold_24h_mm': 50.0, # Default moderate threshold
                'high_threshold_24h_mm': 100.0, # Default high threshold
                'extreme_threshold_24h_mm': 150.0 # Default extreme threshold
            }

        # Get ML-based risk prediction
        ml_prediction = None
        ml_confidence = None
        if external_data:  # Only try ML prediction if we have weather data
            try:
                ml_result = await ml_service.predict_segment_status(segment_id, external_data)
                if ml_result['status'] is not None:
                    ml_prediction = ml_result['status']
                    ml_confidence = ml_result['confidence']
            except Exception as e:
                # Log error but continue with traditional assessment
                print(f"[Risk Assessment] ML prediction failed for segment {segment_id}: {e}")

        # Determine risk level and cause (combining traditional and ML approaches)
        risk_level = "low"
        cause = "normal conditions"

        # Start with traditional assessment
        traditional_risk_level = "low"
        traditional_cause = "normal conditions"

        # Check for critical weather conditions
        if latest_weather:
            if latest_weather.rainfall > 50.0:  # Very heavy rainfall
                traditional_risk_level = "critical"
                traditional_cause = f"extreme rainfall ({latest_weather.rainfall}mm)"
            elif latest_weather.wind_speed > 80.0:  # Extreme wind
                traditional_risk_level = "critical"
                traditional_cause = f"extreme wind speed ({latest_weather.wind_speed}km/h)"
            elif latest_weather.temperature > 45.0 or latest_weather.temperature < -15.0:  # Extreme temperature
                traditional_risk_level = "high"
                traditional_cause = f"extreme temperature ({latest_weather.temperature}°C)"
            elif latest_weather.rainfall > 20.0:  # Heavy rainfall
                if traditional_risk_level == "low":
                    traditional_risk_level = "medium"
                traditional_cause = f"heavy rainfall ({latest_weather.rainfall}mm)"
            elif latest_weather.wind_speed > 50.0:  # Strong wind
                if traditional_risk_level == "low":
                    traditional_risk_level = "medium"
                traditional_cause = f"strong wind ({latest_weather.wind_speed}km/h)"

        # Check for incidents
        if recent_incident_count > 0:
            # Weight incidents by severity
            incident_risk_score = 0
            incident_risk_score += severity_counts.get(IncidentSeverity.HIGH.value, 0) * 2
            incident_risk_score += severity_counts.get(IncidentSeverity.CRITICAL.value, 0) * 3

            if incident_risk_score >= 5:
                traditional_risk_level = "critical"
                traditional_cause = f"multiple critical incidents ({recent_incident_count} active)"
            elif incident_risk_score >= 3:
                if traditional_risk_level in ["low", "medium"]:
                    traditional_risk_level = "high"
                traditional_cause = f"multiple high severity incidents ({recent_incident_count} active)"
            elif incident_risk_score >= 1:
                if traditional_risk_level == "low":
                    traditional_risk_level = "medium"
                traditional_cause = f"active incidents ({recent_incident_count})"

        # If we still have low risk but no specific cause, set a default
        if traditional_risk_level == "low" and traditional_cause == "normal conditions":
            traditional_cause = "normal conditions"

        # Now combine with ML prediction
        # If ML prediction has high confidence and suggests higher risk, use it
        # Otherwise, stick with traditional assessment (but note if ML agrees)
        if ml_prediction and ml_confidence is not None and ml_confidence >= 0.6:
            # ML prediction is confident enough to consider
            # Map ML status to our risk levels
            ml_to_risk = {
                "OPEN": "low",
                "DEGRADED": "medium",
                "BLOCKED": "high"
            }
            ml_risk_level = ml_to_risk.get(ml_prediction, "low")

            # Use the higher of traditional and ML risk levels
            risk_levels = ["low", "medium", "high", "critical"]
            traditional_idx = risk_levels.index(traditional_risk_level) if traditional_risk_level in risk_levels else 0
            ml_idx = risk_levels.index(ml_risk_level) if ml_risk_level in risk_levels else 0

            # Use the higher risk level
            final_idx = max(traditional_idx, ml_idx)
            risk_level = risk_levels[final_idx]

            # Determine cause - if ML contributed significantly to higher risk, mention it
            if ml_idx > traditional_idx:
                cause = f"ML-predicted {ml_prediction.lower()} risk (confidence: {ml_confidence:.2f})"
            elif ml_idx == traditional_idx and traditional_idx > 0:
                # Both agree on elevated risk
                cause = f"{traditional_cause} (confirmed by ML)"
            else:
                cause = traditional_cause
                if ml_confidence is not None:
                    cause += f" (ML confidence: {ml_confidence:.2f})"
        else:
            # Use traditional assessment
            risk_level = traditional_risk_level
            cause = traditional_cause
            if ml_confidence is not None:
                cause += f" (ML confidence: {ml_confidence:.2f})"

        # Predicted at timestamp (when this assessment was made)
        predicted_at = datetime.utcnow().isoformat()

        risk_assessments.append(RiskResponse(
            id=segment_id,
            roadId=segment_id,  # In this implementation, roadId is the same as segment ID
            level=risk_level,
            cause=cause,
            predictedAt=predicted_at,
            mlConfidence=ml_confidence
        ))

    return risk_assessments