"""Add renewal history to orders.

Revision ID: 20261029_0023
Revises: 20261029_0022
"""

from alembic import op
import sqlalchemy as sa


revision = "20261029_0023"
down_revision = "20261029_0022"
branch_labels = None
depends_on = None


def upgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("orders")}
    if "renewal_history" not in columns:
        op.add_column("orders", sa.Column("renewal_history", sa.JSON(), nullable=True))


def downgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("orders")}
    if "renewal_history" in columns:
        op.drop_column("orders", "renewal_history")
