"""Track order asset locations and clean duplicated product lines.

Revision ID: 20261029_0021
Revises: 20261029_0020
"""

from datetime import datetime

from alembic import op
import sqlalchemy as sa


revision = "20261029_0021"
down_revision = "20261029_0020"
branch_labels = None
depends_on = None


def _unique_lines(value: str) -> str:
    seen: set[str] = set()
    result: list[str] = []
    for raw_line in (value or "").splitlines():
        line = raw_line.strip()
        key = line.casefold()
        if line and key not in seen:
            seen.add(key)
            result.append(line)
    return "\n".join(result)


def upgrade() -> None:
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    columns = {column["name"] for column in inspector.get_columns("orders")}
    if "previous_locations" not in columns:
        op.add_column("orders", sa.Column("previous_locations", sa.JSON(), nullable=True))

    orders = sa.table(
        "orders",
        sa.column("id", sa.String(length=36)),
        sa.column("product_description", sa.Text()),
        sa.column("product_quantity", sa.Integer()),
        sa.column("skus", sa.JSON()),
    )
    for row in connection.execute(sa.select(orders.c.id, orders.c.product_description, orders.c.skus)):
        unique_skus = list(dict.fromkeys(sku.strip() for sku in (row.skus or []) if sku and sku.strip()))
        values: dict[str, object] = {"product_description": _unique_lines(row.product_description)}
        if unique_skus:
            values["skus"] = unique_skus
            values["product_quantity"] = len(unique_skus)
        connection.execute(orders.update().where(orders.c.id == row.id).values(**values))

    states = sa.table(
        "inventory_states",
        sa.column("name", sa.String(length=80)),
        sa.column("is_immutable", sa.Boolean()),
        sa.column("sort_order", sa.Integer()),
        sa.column("created_at", sa.DateTime()),
        sa.column("updated_at", sa.DateTime()),
    )
    if connection.execute(sa.select(states.c.name).where(states.c.name == "Despachado")).first() is None:
        now = datetime.utcnow()
        connection.execute(states.insert().values(name="Despachado", is_immutable=True, sort_order=21, created_at=now, updated_at=now))


def downgrade() -> None:
    connection = op.get_bind()
    states = sa.table("inventory_states", sa.column("name", sa.String(length=80)))
    connection.execute(states.delete().where(states.c.name == "Despachado"))
    columns = {column["name"] for column in sa.inspect(connection).get_columns("orders")}
    if "previous_locations" in columns:
        op.drop_column("orders", "previous_locations")
