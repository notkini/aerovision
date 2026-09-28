from typing import List, Optional

from pydantic import BaseModel, Field


class EdgeCameraStatus(BaseModel):
    name: str = "Camera"
    source: str = "/dev/video0"
    status: str = "offline"
    width: Optional[int] = None
    height: Optional[int] = None
    fps: Optional[float] = None
    frame_id: Optional[int] = None


class EdgeCoralStatus(BaseModel):
    status: str = "unknown"
    model: Optional[str] = None


class EdgePixhawkStatus(BaseModel):
    status: str = "unknown"


class EdgeGPSStatus(BaseModel):
    status: str = "unknown"
    fix: Optional[int] = None
    satellites: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude: Optional[float] = None


class EdgeHeartbeat(BaseModel):
    ip_address: Optional[str] = None
    edge_version: Optional[str] = None

    current_mode: Optional[str] = None
    current_mission_id: Optional[int] = None

    cpu_usage: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
    )

    memory_usage: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
    )

    cpu_temperature: Optional[float] = None

    camera: Optional[EdgeCameraStatus] = None
    coral: Optional[EdgeCoralStatus] = None
    pixhawk: Optional[EdgePixhawkStatus] = None
    gps: Optional[EdgeGPSStatus] = None


class EdgeDetection(BaseModel):
    label: str = Field(
        min_length=1,
        max_length=100,
    )

    score: Optional[float] = Field(
        default=None,
        ge=0,
        le=1,
    )

    bbox: Optional[List[float]] = None


class EdgeDetectionBatch(BaseModel):
    frame_id: Optional[int] = None

    mode: str = Field(
        min_length=1,
        max_length=100,
    )

    model: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    inference_ms: Optional[float] = Field(
        default=None,
        ge=0,
    )

    timestamp: Optional[float] = None

    detections: List[EdgeDetection] = Field(
        default_factory=list,
    )