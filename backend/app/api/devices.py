from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import require_roles
from app.auth.device import (
    generate_device_token,
    hash_device_token,
)
from app.db.session import get_db
from app.models import (
    Device,
    DeviceRuntime,
    User,
)
from app.schemas.devices import (
    DeviceCreate,
    DeviceResponse,
    DeviceTokenResponse,
    DeviceUpdate,
)


router = APIRouter(
    prefix="/api/devices",
    tags=["Devices"],
)


MODE_CONFIG: dict[str, dict[str, str]] = {
    "standby": {
        "label": "Standby",
        "landing_path": "/",
    },

    # Traffic Intelligence
    "traffic_overview": {
        "label": "Traffic Overview",
        "landing_path": "/traffic",
    },
    "traffic_no_parking": {
        "label": "No-Parking Zone",
        "landing_path": "/traffic/no-parking",
    },
    "traffic_helmet": {
        "label": "Helmet Compliance",
        "landing_path": "/traffic/helmet",
    },
    "traffic_wrong_way": {
        "label": "Wrong-Way Monitoring",
        "landing_path": "/traffic/wrong-way",
    },
    "traffic_plates": {
        "label": "Plate Monitoring",
        "landing_path": "/traffic/plates",
    },

    # Crowd & Mobility
    "crowd_overview": {
        "label": "Crowd Overview",
        "landing_path": "/crowd",
    },
    "crowd_density": {
        "label": "Crowd Density",
        "landing_path": "/crowd/density",
    },
    "crowd_surge": {
        "label": "Crowd Surge Detection",
        "landing_path": "/crowd/surge",
    },
    "crowd_flow": {
        "label": "Crowd Flow",
        "landing_path": "/crowd/flow",
    },
    "crowd_queues": {
        "label": "Queue Monitoring",
        "landing_path": "/crowd/queues",
    },

    # Road Intelligence
    "road_overview": {
        "label": "Road Overview",
        "landing_path": "/road",
    },
    "road_damage": {
        "label": "Surface Damage",
        "landing_path": "/road/damage",
    },
    "road_potholes": {
        "label": "Pothole Survey",
        "landing_path": "/road/potholes",
    },
    "road_condition": {
        "label": "Road Condition",
        "landing_path": "/road/condition",
    },
    "road_missions": {
        "label": "Inspection Mission",
        "landing_path": "/road/missions",
    },

    # Mobility Safety
    "safety_overview": {
        "label": "Safety Overview",
        "landing_path": "/safety",
    },
    "safety_zones": {
        "label": "Safety Zones",
        "landing_path": "/safety/zones",
    },
    "safety_emergency": {
        "label": "Emergency Access",
        "landing_path": "/safety/emergency",
    },
}


class DeviceModeUpdate(BaseModel):
    mode_key: str = Field(
        min_length=1,
        max_length=100,
    )


class DeviceModeResponse(BaseModel):
    device_id: int
    device_uid: str
    desired_mode: str
    current_mode: str | None
    label: str
    landing_path: str
    modes: list[dict[str, str]]


def _mode_options() -> list[dict[str, str]]:
    return [
        {
            "key": key,
            "label": config["label"],
            "landing_path": config["landing_path"],
        }
        for key, config in MODE_CONFIG.items()
    ]


def _mode_response(
    device: Device,
    runtime: DeviceRuntime,
) -> DeviceModeResponse:

    desired_mode = (
        runtime.desired_mode
        or "standby"
    )


    config = MODE_CONFIG.get(
        desired_mode,
        MODE_CONFIG["standby"],
    )


    return DeviceModeResponse(
        device_id=device.id,
        device_uid=device.device_uid,
        desired_mode=desired_mode,
        current_mode=runtime.current_mode,
        label=config["label"],
        landing_path=config["landing_path"],
        modes=_mode_options(),
    )


@router.get(
    "",
    response_model=list[DeviceResponse],
)
def list_devices(
    _: User = Depends(
        require_roles(
            "ADMIN",
            "OPERATOR",
            "VIEWER",
        )
    ),
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(Device).order_by(
            Device.id
        )
    ).all()


@router.post(
    "",
    response_model=DeviceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_device(
    payload: DeviceCreate,
    _: User = Depends(
        require_roles("ADMIN")
    ),
    db: Session = Depends(get_db),
):
    device_uid = (
        payload.device_uid.strip()
    )


    existing = db.scalar(
        select(Device).where(
            Device.device_uid ==
            device_uid
        )
    )


    if existing is not None:
        raise HTTPException(
            status_code=
            status.HTTP_409_CONFLICT,
            detail=(
                "A device with this UID "
                "already exists."
            ),
        )


    device = Device(
        device_uid=device_uid,
        name=payload.name.strip(),
        device_type=
            payload.device_type.strip(),
        status="offline",
        ip_address=
            payload.ip_address,
    )


    db.add(device)
    db.commit()
    db.refresh(device)


    return device


@router.post(
    "/{device_id}/token",
    response_model=DeviceTokenResponse,
)
def rotate_device_token(
    device_id: int,
    _: User = Depends(
        require_roles("ADMIN")
    ),
    db: Session = Depends(get_db),
):
    device = db.scalar(
        select(Device).where(
            Device.id == device_id
        )
    )


    if device is None:
        raise HTTPException(
            status_code=
            status.HTTP_404_NOT_FOUND,
            detail="Device not found.",
        )


    token = (
        generate_device_token()
    )


    device.api_key_hash = (
        hash_device_token(token)
    )


    device.api_key_prefix = (
        token[:12]
    )


    db.commit()


    return DeviceTokenResponse(
        device_id=device.id,
        device_uid=device.device_uid,
        token=token,
    )


@router.patch(
    "/{device_id}",
    response_model=DeviceResponse,
)
def update_device(
    device_id: int,
    payload: DeviceUpdate,
    _: User = Depends(
        require_roles("ADMIN")
    ),
    db: Session = Depends(get_db),
):
    device = db.scalar(
        select(Device).where(
            Device.id == device_id
        )
    )


    if device is None:
        raise HTTPException(
            status_code=
            status.HTTP_404_NOT_FOUND,
            detail="Device not found.",
        )


    if payload.name is not None:
        device.name = (
            payload.name.strip()
        )


    if payload.device_type is not None:
        device.device_type = (
            payload.device_type.strip()
        )


    if payload.status is not None:
        device.status = (
            payload.status
            .strip()
            .lower()
        )


    if payload.ip_address is not None:
        device.ip_address = (
            payload.ip_address.strip()
        )


    db.commit()
    db.refresh(device)


    return device


@router.get(
    "/{device_id}/mode",
    response_model=DeviceModeResponse,
)
def get_device_mode(
    device_id: int,
    _: User = Depends(
        require_roles(
            "ADMIN",
            "OPERATOR",
            "VIEWER",
        )
    ),
    db: Session = Depends(get_db),
):
    device = db.scalar(
        select(Device).where(
            Device.id == device_id
        )
    )


    if device is None:
        raise HTTPException(
            status_code=
            status.HTTP_404_NOT_FOUND,
            detail="Device not found.",
        )


    runtime = db.scalar(
        select(DeviceRuntime).where(
            DeviceRuntime.device_id ==
            device_id
        )
    )


    if runtime is None:

        runtime = DeviceRuntime(
            device_id=device.id,
            desired_mode="standby",
        )

        db.add(runtime)
        db.commit()
        db.refresh(runtime)


    elif runtime.desired_mode is None:

        if (
            runtime.current_mode in
            MODE_CONFIG
        ):
            runtime.desired_mode = (
                runtime.current_mode
            )
        else:
            runtime.desired_mode = (
                "standby"
            )


        db.commit()
        db.refresh(runtime)


    return _mode_response(
        device,
        runtime,
    )


@router.post(
    "/{device_id}/mode",
    response_model=DeviceModeResponse,
)
def set_device_mode(
    device_id: int,
    payload: DeviceModeUpdate,
    _: User = Depends(
        require_roles(
            "ADMIN",
            "OPERATOR",
            "VIEWER",
        )
    ),
    db: Session = Depends(get_db),
):
    mode_key = (
        payload.mode_key.strip()
    )


    if mode_key not in MODE_CONFIG:
        raise HTTPException(
            status_code=
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Invalid intelligence mode. "
                "The requested page model "
                "is not configured."
            ),
        )


    device = db.scalar(
        select(Device).where(
            Device.id == device_id
        )
    )


    if device is None:
        raise HTTPException(
            status_code=
            status.HTTP_404_NOT_FOUND,
            detail="Device not found.",
        )


    runtime = db.scalar(
        select(DeviceRuntime).where(
            DeviceRuntime.device_id ==
            device_id
        )
    )


    if runtime is None:

        runtime = DeviceRuntime(
            device_id=device.id,
            desired_mode=mode_key,
        )

        db.add(runtime)

    else:

        runtime.desired_mode = (
            mode_key
        )


    db.commit()
    db.refresh(runtime)


    return _mode_response(
        device,
        runtime,
    )


@router.get(
    "/{device_id}/runtime",
)
def get_device_runtime(
    device_id: int,
    _: User = Depends(
        require_roles(
            "ADMIN",
            "OPERATOR",
            "VIEWER",
        )
    ),
    db: Session = Depends(get_db),
):
    runtime = db.scalar(
        select(DeviceRuntime).where(
            DeviceRuntime.device_id ==
            device_id
        )
    )


    if runtime is None:
        raise HTTPException(
            status_code=
            status.HTTP_404_NOT_FOUND,
            detail=(
                "Runtime information is "
                "not available yet."
            ),
        )


    return runtime