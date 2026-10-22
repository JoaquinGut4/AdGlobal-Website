"""Expand inventory photo data URLs to LONGTEXT on MySQL.

Revision ID: 20261022_0011
Revises: 20261022_0010
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


revision = "20261022_0011"
down_revision = "20261022_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if op.get_bind().dialect.name == "mysql":
        op.alter_column(
            "inventory_assets",
            "photo_url",
            existing_type=sa.Text(),
            type_=mysql.LONGTEXT(),
            existing_nullable=False,
        )


def downgrade() -> None:
    if op.get_bind().dialect.name == "mysql":
        op.alter_column(
            "inventory_assets",
            "photo_url",
            existing_type=mysql.LONGTEXT(),
            type_=sa.Text(),
            existing_nullable=False,
        )
