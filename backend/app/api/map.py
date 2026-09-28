from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import require_roles
from app.db.session import get_db
from app.models import Detection, Device, DeviceRuntime, User


router = APIRouter(
    prefix="/api/map",
    tags=["Map Intelligence"],
)


# ============================================================
# LIVE PIXHAWK TELEMETRY
# ============================================================


@router.get("/telemetry")
def get_map_telemetry(
    _: User = Depends(
        require_roles(
            "ADMIN",
            "OPERATOR",
            "VIEWER",
        )
    ),
    db: Session = Depends(get_db),
):
    devices = db.scalars(
        select(Device)
        .order_by(Device.id.asc())
    ).all()

    result = []

    for device in devices:

        runtime = db.scalar(
            select(DeviceRuntime).where(
                DeviceRuntime.device_id
                == device.id
            )
        )

        if runtime is None:

            result.append(
                {
                    "device_id": device.id,
                    "device_uid": device.device_uid,
                    "device_name": device.name,
                    "device_status": device.status,
                    "pixhawk_status": "unknown",
                    "gps_status": "unknown",
                    "gps_fix": None,
                    "satellites": None,
                    "latitude": None,
                    "longitude": None,
                    "altitude": None,
                    "heading": None,
                    "updated_at": None,
                }
            )

            continue

        result.append(
            {
                "device_id": device.id,
                "device_uid": device.device_uid,
                "device_name": device.name,
                "device_status": device.status,

                "pixhawk_status": (
                    runtime.pixhawk_status
                ),

                "gps_status": (
                    runtime.gps_status
                ),

                "gps_fix": (
                    runtime.gps_fix
                ),

                "satellites": (
                    runtime.satellites
                ),

                "latitude": (
                    runtime.latitude
                ),

                "longitude": (
                    runtime.longitude
                ),

                "altitude": (
                    runtime.altitude
                ),

                # Heading is not currently stored in
                # DeviceRuntime, so return null until
                # we add heading persistence.
                "heading": None,

                "updated_at": (
                    runtime.updated_at
                ),
            }
        )

    return {
        "status": "ok",
        "received_at": datetime.now(
            timezone.utc
        ),
        "devices": result,
    }


# ============================================================
# DETECTIONS WITH GPS
# ============================================================


@router.get("/detections")
def get_map_detections(
    limit: int = Query(
        default=1000,
        ge=1,
        le=5000,
    ),
    _: User = Depends(
        require_roles(
            "ADMIN",
            "OPERATOR",
            "VIEWER",
        )
    ),
    db: Session = Depends(get_db),
):
    detections = db.scalars(
        select(Detection)
        .where(
            Detection.latitude.is_not(None),
            Detection.longitude.is_not(None),
        )
        .order_by(
            Detection.detected_at.desc()
        )
        .limit(limit)
    ).all()

    result = []

    for detection in detections:

        result.append(
            {
                "id": detection.id,

                "device_id": (
                    detection.device_id
                ),

                "camera_id": (
                    detection.camera_id
                ),

                "mode_id": (
                    detection.mode_id
                ),

                "object_type": (
                    detection.object_type
                ),

                "confidence": (
                    detection.confidence
                ),

                "frame_id": (
                    detection.frame_id
                ),

                "model_name": (
                    detection.model_name
                ),

                "inference_ms": (
                    detection.inference_ms
                ),

                "bbox": (
                    detection.bbox
                ),

                "latitude": (
                    detection.latitude
                ),

                "longitude": (
                    detection.longitude
                ),

                "detected_at": (
                    detection.detected_at
                ),
            }
        )

    return {
        "status": "ok",
        "count": len(result),
        "detections": result,
    }