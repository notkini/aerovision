from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.cameras import router as cameras_router
from app.api.devices import router as devices_router
from app.api.edge import router as edge_router
from app.api.map import router as map_router
from app.core.config import settings
from app.db.session import get_db


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AeroVision intelligent mobility platform.",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(devices_router)
app.include_router(cameras_router)
app.include_router(edge_router)
app.include_router(map_router)


@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "online",
    }


@app.get("/api/health")
def health(
    db: Session = Depends(get_db),
):
    db.execute(text("SELECT 1"))

    return {
        "status": "healthy",
        "database": "connected",
    }