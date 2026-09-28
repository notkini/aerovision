from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column


from app.db.base import Base


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id"),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    device_uid: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    device_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="offline",
        nullable=False,
    )

    ip_address: Mapped[Optional[str]] = mapped_column(
        String(45),
        nullable=True,
    )

    api_key_hash: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
    )

    api_key_prefix: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )

    last_seen_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

class DeviceRuntime(Base):
    __tablename__ = "device_runtime"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    device_id: Mapped[int] = mapped_column(
        ForeignKey("devices.id"),
        unique=True,
        nullable=False,
    )

    edge_version: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )

    current_mode: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    desired_mode: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    current_mission_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("missions.id"),
        nullable=True,
    )

    camera_status: Mapped[str] = mapped_column(
        String(30),
        default="unknown",
        nullable=False,
    )

    camera_name: Mapped[Optional[str]] = mapped_column(
        String(150),
        nullable=True,
    )

    camera_source: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    camera_width: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    camera_height: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    camera_fps: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    camera_frame_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    coral_status: Mapped[str] = mapped_column(
        String(30),
        default="unknown",
        nullable=False,
    )

    pixhawk_status: Mapped[str] = mapped_column(
        String(30),
        default="unknown",
        nullable=False,
    )

    gps_status: Mapped[str] = mapped_column(
        String(30),
        default="unknown",
        nullable=False,
    )

    gps_fix: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    satellites: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    latitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    longitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    altitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    cpu_usage: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    memory_usage: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    cpu_temperature: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class Camera(Base):
    __tablename__ = "cameras"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    device_id: Mapped[int] = mapped_column(
        ForeignKey("devices.id"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="offline",
        nullable=False,
    )

    width: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    height: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


class Mode(Base):
    __tablename__ = "modes"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    key: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )


class Zone(Base):
    __tablename__ = "zones"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    zone_type: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    radius_meters: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )


class Mission(Base):
    __tablename__ = "missions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    mode_id: Mapped[int] = mapped_column(
        ForeignKey("modes.id"),
        nullable=False,
    )

    device_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("devices.id"),
        nullable=True,
    )

    zone_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("zones.id"),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="created",
        nullable=False,
    )

    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    ended_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


class Detection(Base):
    __tablename__ = "detections"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    device_id: Mapped[int] = mapped_column(
        ForeignKey("devices.id"),
        nullable=False,
    )

    camera_id: Mapped[int] = mapped_column(
        ForeignKey("cameras.id"),
        nullable=False,
    )

    mode_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("modes.id"),
        nullable=True,
    )

    object_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    confidence: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    frame_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )

    model_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    inference_ms: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    bbox: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    latitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    longitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    image_path: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    detected_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    event_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    device_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("devices.id"),
        nullable=True,
    )

    mission_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("missions.id"),
        nullable=True,
    )

    detection_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("detections.id"),
        nullable=True,
    )

    latitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    longitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )


class Plate(Base):
    __tablename__ = "plates"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    plate_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    country: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )

    state: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


class PlateEvent(Base):
    __tablename__ = "plate_events"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    plate_id: Mapped[int] = mapped_column(
        ForeignKey("plates.id"),
        nullable=False,
    )

    detection_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("detections.id"),
        nullable=True,
    )

    device_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("devices.id"),
        nullable=True,
    )

    confidence: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    captured_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )


class Violation(Base):
    __tablename__ = "violations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    violation_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    plate_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("plates.id"),
        nullable=True,
    )

    detection_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("detections.id"),
        nullable=True,
    )

    zone_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("zones.id"),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="open",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    alert_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    event_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("events.id"),
        nullable=True,
    )

    is_resolved: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    action: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    entity_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    entity_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    details: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )