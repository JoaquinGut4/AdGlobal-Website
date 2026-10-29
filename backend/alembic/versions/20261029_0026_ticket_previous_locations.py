"""Store the previous asset location when a ticket moves equipment to Taller.

Revision ID: 20261029_0026
Revises: 20261029_0025
"""

from alembic import op
import sqlalchemy as sa


revision = "20261029_0026"
down_revision = "20261029_0025"
branch_labels = None
depends_on = None


def upgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("support_tickets")}
    if "previous_locations" not in columns:
        op.add_column("support_tickets", sa.Column("previous_locations", sa.JSON(), nullable=True))


def downgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("support_tickets")}
    if "previous_locations" in columns:
        op.drop_column("support_tickets", "previous_locations")
