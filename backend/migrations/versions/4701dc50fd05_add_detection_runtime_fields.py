"""add detection runtime fields

Revision ID: 4701dc50fd05
Revises: 5b79ec24f393
Create Date: 2026-09-26 13:22:23.384889

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4701dc50fd05"
down_revision: Union[str, Sequence[str], None] = "5b79ec24f393"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "detections",
        sa.Column(
            "frame_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "detections",
        sa.Column(
            "model_name",
            sa.String(length=100),
            nullable=True,
        ),
    )

    op.add_column(
        "detections",
        sa.Column(
            "inference_ms",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "detections",
        sa.Column(
            "bbox",
            sa.Text(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_detections_frame_id",
        "detections",
        ["frame_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        "ix_detections_frame_id",
        table_name="detections",
    )

    op.drop_column(
        "detections",
        "bbox",
    )

    op.drop_column(
        "detections",
        "inference_ms",
    )

    op.drop_column(
        "detections",
        "model_name",
    )

    op.drop_column(
        "detections",
        "frame_id",
    )