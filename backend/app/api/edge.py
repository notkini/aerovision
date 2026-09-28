import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.device import get_authenticated_device
from app.db.session import get_db
from app.models import (
    Camera,
    Detection,
    Device,
    DeviceRuntime,
    Mode,
)
from app.schemas.edge import (
    EdgeDetectionBatch,
    EdgeHeartbeat,
)


router = APIRouter(
    prefix="/api/edge",
    tags=["Edge Devices"],
)


# ============================================================
# HEARTBEAT
# ============================================================


@router.post("/heartbeat")
def heartbeat(
    payload: EdgeHeartbeat,
    device: Device = Depends(
        get_authenticated_device
    ),
    db: Session = Depends(get_db),
):
    now = datetime.now(
        timezone.utc
    )

    # --------------------------------------------------------
    # Device
    # --------------------------------------------------------

    device.status = "online"

    device.last_seen_at = now

    if payload.ip_address:

        device.ip_address = (
            payload.ip_address
        )

    # --------------------------------------------------------
    # Runtime
    # --------------------------------------------------------

    runtime = db.scalar(
        select(DeviceRuntime).where(
            DeviceRuntime.device_id
            == device.id
        )
    )

    if runtime is None:

        runtime = DeviceRuntime(
            device_id=device.id
        )

        db.add(runtime)

    # --------------------------------------------------------
    # Desired mode
    #
    # desired_mode is controlled by the dashboard.
    #
    # current_mode is reported by the Pi.
    # --------------------------------------------------------

    if (
        getattr(
            runtime,
            "desired_mode",
            None,
        )
        is None
    ):

        runtime.desired_mode = (
            payload.current_mode
            or "standby"
        )

    # --------------------------------------------------------
    # Edge runtime telemetry
    # --------------------------------------------------------

    runtime.edge_version = (
        payload.edge_version
    )

    runtime.current_mode = (
        payload.current_mode
    )

    runtime.current_mission_id = (
        payload.current_mission_id
    )

    runtime.cpu_usage = (
        payload.cpu_usage
    )

    runtime.memory_usage = (
        payload.memory_usage
    )

    runtime.cpu_temperature = (
        payload.cpu_temperature
    )

    # --------------------------------------------------------
    # Camera
    # --------------------------------------------------------

    if payload.camera:

        runtime.camera_status = (
            payload.camera.status
        )

        runtime.camera_name = (
            payload.camera.name
        )

        runtime.camera_source = (
            payload.camera.source
        )

        runtime.camera_width = (
            payload.camera.width
        )

        runtime.camera_height = (
            payload.camera.height
        )

        runtime.camera_fps = (
            payload.camera.fps
        )

        runtime.camera_frame_id = (
            payload.camera.frame_id
        )

        camera = db.scalar(
            select(Camera).where(
                Camera.device_id
                == device.id
            )
        )

        if camera is not None:

            camera.status = (
                payload.camera.status
            )

            camera.name = (
                payload.camera.name
            )

            camera.source = (
                payload.camera.source
            )

            camera.width = (
                payload.camera.width
            )

            camera.height = (
                payload.camera.height
            )

    # --------------------------------------------------------
    # Coral
    # --------------------------------------------------------

    if payload.coral:

        runtime.coral_status = (
            payload.coral.status
        )

    # --------------------------------------------------------
    # Pixhawk
    # --------------------------------------------------------

    if payload.pixhawk:

        runtime.pixhawk_status = (
            payload.pixhawk.status
        )

    # --------------------------------------------------------
    # GPS
    # --------------------------------------------------------

    if payload.gps:

        runtime.gps_status = (
            payload.gps.status
        )

        runtime.gps_fix = (
            payload.gps.fix
        )

        runtime.satellites = (
            payload.gps.satellites
        )

        runtime.latitude = (
            payload.gps.latitude
        )

        runtime.longitude = (
            payload.gps.longitude
        )

        runtime.altitude = (
            payload.gps.altitude
        )

    runtime.updated_at = now

    db.commit()

    # --------------------------------------------------------
    # Return desired_mode to the Pi
    # --------------------------------------------------------

    return {
        "status": "accepted",

        "device_uid": (
            device.device_uid
        ),

        "desired_mode": (
            runtime.desired_mode
        ),

        "current_mode": (
            runtime.current_mode
        ),

        "received_at": now,
    }


# ============================================================
# DETECTIONS
# ============================================================


@router.post("/detections")
def receive_detections(
    payload: EdgeDetectionBatch,
    device: Device = Depends(
        get_authenticated_device
    ),
    db: Session = Depends(get_db),
):
    now = datetime.now(
        timezone.utc
    )

    # --------------------------------------------------------
    # Find camera
    # --------------------------------------------------------

    camera = db.scalar(
        select(Camera)
        .where(
            Camera.device_id
            == device.id
        )
        .order_by(
            Camera.id.asc()
        )
    )

    if camera is None:

        raise HTTPException(
            status_code=400,
            detail=(
                "No camera is registered "
                "for this device."
            ),
        )

    # --------------------------------------------------------
    # Find mode
    # --------------------------------------------------------

    mode = db.scalar(
        select(Mode).where(
            Mode.key == payload.mode
        )
    )

    # --------------------------------------------------------
    # Get latest Pixhawk/GPS position
    #
    # This is the important part for Map Intelligence.
    # --------------------------------------------------------

    runtime = db.scalar(
        select(DeviceRuntime).where(
            DeviceRuntime.device_id
            == device.id
        )
    )

    latitude = None

    longitude = None

    altitude = None

    if runtime is not None:

        latitude = (
            runtime.latitude
        )

        longitude = (
            runtime.longitude
        )

        altitude = (
            runtime.altitude
        )

    # --------------------------------------------------------
    # Optional GPS override from edge payload
    #
    # The current EdgeDetectionBatch schema does not yet
    # define latitude/longitude, so this safely checks for
    # them without requiring a schema change.
    # --------------------------------------------------------

    payload_latitude = getattr(
        payload,
        "latitude",
        None,
    )

    payload_longitude = getattr(
        payload,
        "longitude",
        None,
    )

    if payload_latitude is not None:

        latitude = (
            payload_latitude
        )

    if payload_longitude is not None:

        longitude = (
            payload_longitude
        )

    # --------------------------------------------------------
    # No detections
    # --------------------------------------------------------

    if not payload.detections:

        return {
            "status": "accepted",

            "device_uid": (
                device.device_uid
            ),

            "frame_id": (
                payload.frame_id
            ),

            "saved": 0,

            "latitude": latitude,

            "longitude": longitude,

            "altitude": altitude,

            "received_at": now,
        }

    # --------------------------------------------------------
    # Save detections
    # --------------------------------------------------------

    saved_count = 0

    for item in payload.detections:

        bbox_json = None

        if item.bbox is not None:

            bbox_json = json.dumps(
                item.bbox
            )

        detection = Detection(

            device_id=device.id,

            camera_id=camera.id,

            mode_id=(
                mode.id
                if mode
                else None
            ),

            object_type=item.label,

            confidence=item.score,

            frame_id=payload.frame_id,

            model_name=payload.model,

            inference_ms=(
                payload.inference_ms
            ),

            bbox=bbox_json,

            # ----------------------------------------------
            # Pixhawk GPS position
            # ----------------------------------------------

            latitude=latitude,

            longitude=longitude,

            detected_at=now,
        )

        db.add(detection)

        saved_count += 1

    db.commit()

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "status": "accepted",

        "device_uid": (
            device.device_uid
        ),

        "frame_id": (
            payload.frame_id
        ),

        "saved": saved_count,

        "latitude": latitude,

        "longitude": longitude,

        "altitude": altitude,

        "received_at": now,
    }