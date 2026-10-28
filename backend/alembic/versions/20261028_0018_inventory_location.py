"""Add a dedicated location to inventory assets.

Revision ID: 20261028_0018
Revises: 20261026_0017
"""

from alembic import op
import sqlalchemy as sa


revision = "20261028_0018"
down_revision = "20261026_0017"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("inventory_assets") as batch_op:
        batch_op.add_column(
            sa.Column(
                "location",
                sa.String(length=40),
                nullable=False,
                server_default="Almacén 1",
            )
        )
        batch_op.create_index("ix_inventory_assets_location", ["location"], unique=False)


def downgrade() -> None:
    with op.batch_alter_table("inventory_assets") as batch_op:
        batch_op.drop_index("ix_inventory_assets_location")
        batch_op.drop_column("location")
