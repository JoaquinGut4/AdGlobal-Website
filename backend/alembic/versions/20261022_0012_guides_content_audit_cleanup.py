"""Add guides/content/audit metadata and remove unused CRM tables.

Revision ID: 20261022_0012
Revises: 20261022_0011
"""

from datetime import UTC, datetime

from alembic import op
import sqlalchemy as sa


revision = "20261022_0012"
down_revision = "20261022_0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("audit_logs", sa.Column("ip_address", sa.String(length=64), nullable=False, server_default=""))
    op.add_column("audit_logs", sa.Column("device", sa.String(length=500), nullable=False, server_default=""))

    if op.get_bind().dialect.name == "mysql":
        inspector = sa.inspect(op.get_bind())
        old_fk = next(
            (fk["name"] for fk in inspector.get_foreign_keys("support_tickets") if fk["constrained_columns"] == ["technician_id"]),
            None,
        )
        with op.batch_alter_table("support_tickets") as batch:
            batch.add_column(sa.Column("support_user_id", sa.String(length=36), nullable=True))
            batch.create_foreign_key("fk_support_tickets_support_user", "admin_users", ["support_user_id"], ["id"])
            if old_fk:
                batch.drop_constraint(old_fk, type_="foreignkey")
            batch.drop_column("technician_id")
        op.drop_table("technicians")
        op.drop_table("customers")
        op.drop_table("quote_requests")
    else:
        with op.batch_alter_table("support_tickets") as batch:
            batch.add_column(sa.Column("support_user_id", sa.String(length=36), nullable=True))

    op.create_table(
        "shipping_guides",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("order_id", sa.String(length=36), nullable=False, unique=True),
        sa.Column("guide_number", sa.String(length=30), nullable=False),
        sa.Column("transfer_date", sa.Date(), nullable=False),
        sa.Column("recipient_ruc", sa.String(length=20), nullable=False, server_default=""),
        sa.Column("recipient_document", sa.String(length=20), nullable=False, server_default=""),
        sa.Column("vehicle", sa.String(length=200), nullable=False, server_default=""),
        sa.Column("registration_certificate", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("driver_license", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("driver_document", sa.String(length=20), nullable=False, server_default=""),
        sa.Column("carrier", sa.String(length=200), nullable=False, server_default=""),
        sa.Column("carrier_ruc", sa.String(length=20), nullable=False, server_default=""),
        sa.Column("transfer_cost", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("receipt_type", sa.String(length=80), nullable=False, server_default=""),
        sa.Column("receipt_number", sa.String(length=80), nullable=False, server_default=""),
        sa.Column("reasons", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="Borrador"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_shipping_guides_order_id", "shipping_guides", ["order_id"], unique=True)
    op.create_table(
        "shipping_guide_items",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("guide_id", sa.String(length=36), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("quantity", sa.Numeric(12, 2), nullable=False),
        sa.Column("unit", sa.String(length=20), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("weight", sa.Numeric(12, 2), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["guide_id"], ["shipping_guides.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_shipping_guide_items_guide_id", "shipping_guide_items", ["guide_id"])

    op.create_table(
        "site_content",
        sa.Column("key", sa.String(length=80), primary_key=True),
        sa.Column("value", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "faqs",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("question", sa.String(length=500), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    now = datetime.now(UTC).replace(tzinfo=None)
    content = sa.table("site_content", sa.column("key"), sa.column("value", sa.JSON()), sa.column("created_at"), sa.column("updated_at"))
    op.bulk_insert(content, [
        {"key": "hero", "value": {"headline": "Potencia tu empresa con tecnología de punta", "highlights": ["tecnología de punta"], "supporting": "Alquiler y venta de equipos de cómputo, audiovisuales y desarrollo web para empresas, con soporte técnico propio en todo el Perú y Colombia. Respaldados por +10 años de experiencia.", "action": "Pedir cotización"}, "created_at": now, "updated_at": now},
        {"key": "about", "value": {"heading": "Quiénes somos", "statement": "Alquilamos y vendemos equipos de cómputo y audiovisuales, con soporte técnico propio.", "description": "Somos una corporación especializada en el arrendamiento de equipos informáticos y audiovisuales, mantenimiento, soporte técnico y proyectos a medida.", "mission": {"title": "Misión", "text": "Brindar soluciones tecnológicas de calidad, eficientes y flexibles."}, "vision": {"title": "Visión", "text": "Ser una empresa líder en soluciones tecnológicas de vanguardia."}}, "created_at": now, "updated_at": now},
        {"key": "advantages", "value": [], "created_at": now, "updated_at": now},
        {"key": "partners", "value": ["HP", "Dell", "Lenovo", "Asus", "Microsoft", "Deltron", "Brother", "LG", "Teros", "Samsung", "Canon"], "created_at": now, "updated_at": now},
        {"key": "industries", "value": ["Corporativos", "Estatales", "Minería", "Universidades", "Retail", "CPG", "Energía", "Consultoría", "Automotriz", "Manufactura", "Telecomunicaciones", "Servicios"], "created_at": now, "updated_at": now},
        {"key": "contact", "value": {"address": {"full": "Av. Húsares de Junín 527, Jesús María 15072, Lima"}, "social": {"facebook": "https://www.facebook.com/people/AD-Global/61566838716640/", "instagram": "https://www.instagram.com/adglobals/", "linkedin": "https://linkedin.com/company/adglobalperu", "tiktok": "https://www.tiktok.com/@adglobals"}, "schedule": {"weekdays": "Lunes a viernes, 9:00 – 18:00", "saturdays": "Sábados, 9:00 – 13:00"}}, "created_at": now, "updated_at": now},
    ])
    faq = sa.table("faqs", sa.column("id"), sa.column("question"), sa.column("answer"), sa.column("sort_order"), sa.column("is_active"), sa.column("created_at"), sa.column("updated_at"))
    rows = [
        ("faq-1", "¿Cómo alquilo equipos con AD GLOBAL?", "Envíanos tu requerimiento con cantidades, fechas y ciudad. Te enviaremos una cotización formal."),
        ("faq-2", "¿Tienen cobertura fuera de Lima?", "Sí. Operamos en las 24 regiones del Perú y atendemos proyectos en Colombia."),
        ("faq-3", "¿Qué incluye el servicio de alquiler?", "Entrega, instalación, configuración, soporte técnico y equipos de reemplazo."),
        ("faq-4", "¿Venden equipos o solo alquilan?", "Alquilamos y vendemos equipos, licencias y proyectos de software a medida."),
        ("faq-5", "¿Qué necesito para pedir una cotización?", "Razón social o RUC, contacto, ciudad, fechas y lista aproximada de equipos."),
    ]
    op.bulk_insert(faq, [{"id": i, "question": q, "answer": a, "sort_order": n, "is_active": True, "created_at": now, "updated_at": now} for n, (i, q, a) in enumerate(rows)])


def downgrade() -> None:
    op.drop_table("faqs")
    op.drop_table("site_content")
    op.drop_index("ix_shipping_guide_items_guide_id", table_name="shipping_guide_items")
    op.drop_table("shipping_guide_items")
    op.drop_index("ix_shipping_guides_order_id", table_name="shipping_guides")
    op.drop_table("shipping_guides")
    # Removed legacy tables are intentionally not reconstructed with data.
    op.drop_column("audit_logs", "device")
    op.drop_column("audit_logs", "ip_address")
