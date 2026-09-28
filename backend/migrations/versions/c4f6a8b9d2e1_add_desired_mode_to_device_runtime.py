"""add desired mode to device runtime

Revision ID: c4f6a8b9d2e1
Revises: 4701dc50fd05
Create Date: 2026-09-26
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c4f6a8b9d2e1"
down_revision = "4701dc50fd05"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "device_runtime",
        sa.Column(
            "desired_mode",
            sa.String(length=100),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "device_runtime",
        "desired_mode",
    )