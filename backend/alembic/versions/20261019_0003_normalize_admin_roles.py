"""Normaliza los roles administrativos a Administrador, Soporte y Normal.

Revision ID: 20261019_0003
Revises: 20261019_0002
"""
from typing import Sequence, Union

from alembic import op


revision: str = "20261019_0003"
down_revision: Union[str, None] = "20261019_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "UPDATE admin_users SET role = 'Normal' "
        "WHERE role NOT IN ('Administrador', 'Soporte', 'Normal')"
    )


def downgrade() -> None:
    # No se restaura el rol anterior porque la información original no se conserva.
    pass
