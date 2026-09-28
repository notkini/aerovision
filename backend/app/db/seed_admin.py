import os
import sys

from sqlalchemy import select

from app.auth.security import hash_password
from app.db.session import SessionLocal
from app.models import Role, User


def main() -> None:
    email = os.getenv(
        "AEROVISION_ADMIN_EMAIL"
    )

    password = os.getenv(
        "AEROVISION_ADMIN_PASSWORD"
    )

    full_name = os.getenv(
        "AEROVISION_ADMIN_NAME",
        "AeroVision Administrator",
    )

    if not email or not password:
        print(
            "Set AEROVISION_ADMIN_EMAIL and "
            "AEROVISION_ADMIN_PASSWORD first."
        )
        sys.exit(1)

    if len(password) < 8:
        print(
            "Admin password must contain at least 8 characters."
        )
        sys.exit(1)

    db = SessionLocal()

    try:
        admin_role = db.scalar(
            select(Role).where(
                Role.name == "ADMIN"
            )
        )

        if admin_role is None:
            print(
                "ADMIN role does not exist. "
                "Run the role/mode seed first."
            )
            sys.exit(1)

        existing_user = db.scalar(
            select(User).where(
                User.email == email.lower()
            )
        )

        if existing_user is not None:
            print(
                f"User {email} already exists."
            )
            sys.exit(0)

        user = User(
            email=email.lower(),
            password_hash=hash_password(password),
            full_name=full_name,
            role_id=admin_role.id,
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print("AeroVision admin created.")
        print(f"Email: {user.email}")
        print(f"User ID: {user.id}")

    finally:
        db.close()


if __name__ == "__main__":
    main()