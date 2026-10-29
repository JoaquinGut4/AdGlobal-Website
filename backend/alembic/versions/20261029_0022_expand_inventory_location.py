"""Expand inventory location for customer and order references.

Revision ID: 20261029_0022
Revises: 20261029_0021
"""

from alembic import op
import sqlalchemy as sa


revision = "20261029_0022"
down_revision = "20261029_0021"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("inventory_assets") as batch_op:
        batch_op.alter_column(
            "location",
            existing_type=sa.String(length=40),
            type_=sa.String(length=255),
            existing_nullable=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("inventory_assets") as batch_op:
        batch_op.alter_column(
            "location",
            existing_type=sa.String(length=255),
            type_=sa.String(length=40),
            existing_nullable=False,
        )
