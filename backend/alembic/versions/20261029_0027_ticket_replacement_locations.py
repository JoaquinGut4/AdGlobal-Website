"""Store the previous location of ticket replacement equipment.

Revision ID: 20261029_0027
Revises: 20261029_0026
"""

from alembic import op
import sqlalchemy as sa


revision = "20261029_0027"
down_revision = "20261029_0026"
branch_labels = None
depends_on = None


def upgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("support_tickets")}
    if "replacement_previous_locations" not in columns:
        op.add_column("support_tickets", sa.Column("replacement_previous_locations", sa.JSON(), nullable=True))


def downgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("support_tickets")}
    if "replacement_previous_locations" in columns:
        op.drop_column("support_tickets", "replacement_previous_locations")
