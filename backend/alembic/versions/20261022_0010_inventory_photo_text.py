"""Allow optimized inventory photos stored as data URLs.

Revision ID: 20261022_0010
Revises: 20261022_0009
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


revision = "20261022_0010"
down_revision = "20261022_0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if op.get_bind().dialect.name != "sqlite":
        op.alter_column(
            "inventory_assets",
            "photo_url",
            existing_type=sa.String(length=500),
            type_=mysql.LONGTEXT(),
            existing_nullable=False,
        )


def downgrade() -> None:
    if op.get_bind().dialect.name != "sqlite":
        op.alter_column(
            "inventory_assets",
            "photo_url",
            existing_type=mysql.LONGTEXT(),
            type_=sa.String(length=500),
            existing_nullable=False,
        )
