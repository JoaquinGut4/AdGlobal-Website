"""Rol y teléfono de usuarios administrativos.

Revision ID: 20261019_0002
Revises: 20261019_0001
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261019_0002"
down_revision: Union[str, None] = "20261019_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "admin_users",
        sa.Column("role", sa.String(length=40), nullable=False, server_default="Administrador"),
    )
    op.add_column(
        "admin_users",
        sa.Column("phone", sa.String(length=30), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_column("admin_users", "phone")
    op.drop_column("admin_users", "role")
