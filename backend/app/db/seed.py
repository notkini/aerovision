from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import Mode, Role


ROLES = [
    (
        "ADMIN",
        "Full AeroVision administration access.",
    ),
    (
        "OPERATOR",
        "Operational access to missions and intelligence.",
    ),
    (
        "VIEWER",
        "Read-only access to AeroVision data.",
    ),
]


MODES = [
    (
        "traffic_overview",
        "Traffic Overview",
        "Traffic Intelligence",
        "Monitor vehicle activity and traffic conditions.",
    ),
    (
        "no_parking",
        "No-Parking Zone",
        "Traffic Intelligence",
        "Monitor vehicles entering designated restricted parking zones.",
    ),
    (
        "helmet_compliance",
        "Helmet Compliance",
        "Traffic Intelligence",
        "Monitor rider helmet compliance.",
    ),
    (
        "wrong_way",
        "Wrong-Way Monitoring",
        "Traffic Intelligence",
        "Monitor vehicles moving against configured road directions.",
    ),
    (
        "plate_monitoring",
        "Plate Monitoring",
        "Traffic Intelligence",
        "Monitor captured number plates and plate events.",
    ),
    (
        "crowd_density",
        "Crowd Density",
        "Crowd & Mobility",
        "Monitor crowd density across configured locations.",
    ),
    (
        "crowd_surge",
        "Crowd Surge Detection",
        "Crowd & Mobility",
        "Monitor rapid changes in crowd density and movement.",
    ),
    (
        "crowd_flow",
        "Crowd Flow",
        "Crowd & Mobility",
        "Monitor movement direction and flow patterns.",
    ),
    (
        "queue_monitoring",
        "Queue Monitoring",
        "Crowd & Mobility",
        "Monitor queues and congestion.",
    ),
    (
        "surface_damage",
        "Surface Damage",
        "Road Intelligence",
        "Detect and record road surface damage.",
    ),
    (
        "pothole_survey",
        "Pothole Survey",
        "Road Intelligence",
        "Record potholes with images and locations.",
    ),
    (
        "road_condition",
        "Road Condition",
        "Road Intelligence",
        "Build a geospatial view of road conditions.",
    ),
    (
        "inspection_mission",
        "Inspection Mission",
        "Road Intelligence",
        "Run mobile road inspection missions.",
    ),
]


def seed() -> None:
    db = SessionLocal()

    try:
        for name, description in ROLES:
            existing = db.scalar(
                select(Role).where(Role.name == name)
            )

            if existing is None:
                db.add(
                    Role(
                        name=name,
                        description=description,
                    )
                )

        for key, name, category, description in MODES:
            existing = db.scalar(
                select(Mode).where(Mode.key == key)
            )

            if existing is None:
                db.add(
                    Mode(
                        key=key,
                        name=name,
                        category=category,
                        description=description,
                    )
                )

        db.commit()

        print("AeroVision seed completed.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()