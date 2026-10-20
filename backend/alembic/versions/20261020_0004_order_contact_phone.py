"""Add contact phone to orders without changing existing records.

Revision ID: 20261020_0004
Revises: 20261019_0003
"""

from alembic import op
import sqlalchemy as sa


revision = "20261020_0004"
down_revision = "20261019_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("contact_phone", sa.String(length=30), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_column("orders", "contact_phone")
