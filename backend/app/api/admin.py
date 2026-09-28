from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import require_roles, get_user_role
from app.auth.security import hash_password
from app.db.session import get_db
from app.models import Role, User
from app.schemas.admin import (
    AdminUserCreate,
    AdminUserResponse,
    AdminUserUpdate,
)


router = APIRouter(
    prefix="/api/admin",
    tags=["Administration"],
)


@router.get(
    "/users",
    response_model=list[AdminUserResponse],
)
def list_users(
    _: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db),
):
    users = db.scalars(
        select(User).order_by(User.id)
    ).all()

    results = []

    for user in users:
        role = get_user_role(user, db)

        results.append(
            AdminUserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                role=role,
                is_active=user.is_active,
            )
        )

    return results


@router.post(
    "/users",
    response_model=AdminUserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    payload: AdminUserCreate,
    _: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db),
):
    email = payload.email.strip().lower()
    requested_role = payload.role.strip().upper()

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    role = db.scalar(
        select(Role).where(
            Role.name == requested_role
        )
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role.",
        )

    user = User(
        email=email,
        full_name=payload.full_name.strip(),
        password_hash=hash_password(payload.password),
        role_id=role.id,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return AdminUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=role.name,
        is_active=user.is_active,
    )


@router.patch(
    "/users/{user_id}",
    response_model=AdminUserResponse,
)
def update_user(
    user_id: int,
    payload: AdminUserUpdate,
    current_admin: User = Depends(
        require_roles("ADMIN")
    ),
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(User.id == user_id)
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if (
        payload.is_active is False
        and user.id == current_admin.id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account.",
        )

    if payload.role is not None:
        requested_role = payload.role.strip().upper()

        role = db.scalar(
            select(Role).where(
                Role.name == requested_role
            )
        )

        if role is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role.",
            )

        user.role_id = role.id

    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)

    role_name = get_user_role(user, db)

    return AdminUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=role_name,
        is_active=user.is_active,
    )