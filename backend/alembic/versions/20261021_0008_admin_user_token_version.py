"""Invalidate issued tokens when an administrator's credentials or permissions change.

Revision ID: 20261021_0008
Revises: 20261020_0007
"""

from alembic import op
import sqlalchemy as sa


revision = "20261021_0008"
down_revision = "20261020_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "admin_users",
        sa.Column("token_version", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("admin_users", "token_version")
