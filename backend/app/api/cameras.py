from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_roles
from app.db.session import get_db
from app.models import Camera, Device, User
from app.schemas.cameras import (
    CameraCreate,
    CameraResponse,
    CameraUpdate,
)


router = APIRouter(
    prefix="/api/cameras",
    tags=["Cameras"],
)


@router.get(
    "",
    response_model=list[CameraResponse],
)
def list_cameras(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(Camera).order_by(Camera.id)
    ).all()


@router.post(
    "",
    response_model=CameraResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_camera(
    payload: CameraCreate,
    _: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db),
):
    device = db.scalar(
        select(Device).where(
            Device.id == payload.device_id
        )
    )

    if device is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found.",
        )

    camera = Camera(
        device_id=payload.device_id,
        name=payload.name.strip(),
        source=payload.source.strip(),
        status="offline",
        width=payload.width,
        height=payload.height,
    )

    db.add(camera)
    db.commit()
    db.refresh(camera)

    return camera


@router.patch(
    "/{camera_id}",
    response_model=CameraResponse,
)
def update_camera(
    camera_id: int,
    payload: CameraUpdate,
    _: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db),
):
    camera = db.scalar(
        select(Camera).where(
            Camera.id == camera_id
        )
    )

    if camera is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found.",
        )

    if payload.name is not None:
        camera.name = payload.name.strip()

    if payload.source is not None:
        camera.source = payload.source.strip()

    if payload.status is not None:
        camera.status = payload.status.strip().lower()

    if payload.width is not None:
        camera.width = payload.width

    if payload.height is not None:
        camera.height = payload.height

    db.commit()
    db.refresh(camera)

    return camera


@router.post(
    "/{camera_id}/status",
    response_model=CameraResponse,
)
def update_camera_status(
    camera_id: int,
    payload: CameraUpdate,
    db: Session = Depends(get_db),
):
    camera = db.scalar(
        select(Camera).where(
            Camera.id == camera_id
        )
    )

    if camera is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found.",
        )

    if payload.status is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status is required.",
        )

    camera.status = payload.status.strip().lower()

    db.commit()
    db.refresh(camera)

    return camera