from datetime import UTC, date, datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.core.database import Base


def new_id() -> str:
    return str(uuid4())


def utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def as_utc(value: datetime) -> datetime:
    """Marca como UTC una fecha guardada sin zona horaria.

    MySQL no conserva el offset, así que las columnas se guardan en UTC sin
    ``tzinfo``. Al serializar hay que devolver el offset para que el navegador
    no interprete la hora como local.
    """
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)


class AdminUser(TimestampMixin, Base):
    __tablename__ = "admin_users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    full_name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(190), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(40), default="Administrador")
    phone: Mapped[str] = mapped_column(String(30), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_super_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    modules: Mapped[list[str]] = mapped_column(JSON, default=list)
    token_version: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class InventoryCategory(TimestampMixin, Base):
    __tablename__ = "inventory_categories"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    label: Mapped[str] = mapped_column(String(120), unique=True)
    code: Mapped[int] = mapped_column(Integer, unique=True)
    icon_name: Mapped[str] = mapped_column(String(30), default="package")
    base_fields: Mapped[list[str] | None] = mapped_column(JSON, default=list, nullable=True)
    custom_fields: Mapped[list[dict]] = mapped_column(JSON, default=list)

    assets: Mapped[list["InventoryAsset"]] = relationship(back_populates="category")


class InventoryState(TimestampMixin, Base):
    __tablename__ = "inventory_states"

    name: Mapped[str] = mapped_column(String(80), primary_key=True)
    is_immutable: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class InventoryAsset(TimestampMixin, Base):
    __tablename__ = "inventory_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    category_id: Mapped[str] = mapped_column(ForeignKey("inventory_categories.id"), index=True)
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    qr: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    photo_url: Mapped[str] = mapped_column(Text().with_variant(LONGTEXT(), "mysql"), default="")
    item: Mapped[str | None] = mapped_column(String(120), nullable=True)
    brand: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(300))
    serial_number: Mapped[str | None] = mapped_column(String(160), unique=True, index=True, nullable=True)
    processor: Mapped[str | None] = mapped_column(String(120), nullable=True)
    ghz: Mapped[str | None] = mapped_column(String(40), nullable=True)
    generation: Mapped[str | None] = mapped_column(String(40), nullable=True)
    screen: Mapped[str | None] = mapped_column(String(60), nullable=True)
    ram: Mapped[str | None] = mapped_column(String(60), nullable=True)
    storage: Mapped[str | None] = mapped_column(String(60), nullable=True)
    storage_type: Mapped[str | None] = mapped_column(String(60), nullable=True)
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    purchase_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    purchase_document: Mapped[str] = mapped_column(String(100))
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    supplier: Mapped[str] = mapped_column(String(160))
    rentable: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    status: Mapped[str] = mapped_column(String(80), index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    custom_specs: Mapped[dict] = mapped_column(JSON, default=dict)

    category: Mapped[InventoryCategory] = relationship(back_populates="assets")


class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    order_number: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    issue_date: Mapped[date] = mapped_column(Date, index=True)
    origin_address: Mapped[str] = mapped_column(Text)
    destination_address: Mapped[str] = mapped_column(Text)
    contact_phone: Mapped[str] = mapped_column(String(30), default="")
    product_description: Mapped[str] = mapped_column(Text)
    product_quantity: Mapped[int] = mapped_column(Integer)
    unit: Mapped[str] = mapped_column(String(10), default="UND")
    transfer_reason: Mapped[str] = mapped_column(String(160), index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    operational_status: Mapped[str] = mapped_column(String(20), default="Activo")
    finalized_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    skus: Mapped[list[str] | None] = mapped_column(JSON, default=list, nullable=True)
    previous_states: Mapped[dict[str, str] | None] = mapped_column(JSON, default=dict, nullable=True)


class SupportTicket(TimestampMixin, Base):
    __tablename__ = "support_tickets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    area: Mapped[str | None] = mapped_column(String(80), nullable=True)
    equipment: Mapped[str] = mapped_column(Text)
    customer: Mapped[str] = mapped_column(String(200))
    priority: Mapped[str] = mapped_column(String(20), index=True)
    status: Mapped[str] = mapped_column(String(30), default="Abierto", index=True)
    description: Mapped[str] = mapped_column(Text)
    order_or_status: Mapped[str] = mapped_column(String(2048), default="")
    ticket_type: Mapped[str] = mapped_column(String(20), default="")
    order_number: Mapped[str] = mapped_column(String(30), default="")
    contact_phone: Mapped[str] = mapped_column(String(40), default="")
    order_address: Mapped[str] = mapped_column(String(1000), default="")
    equipment_status: Mapped[str] = mapped_column(String(80), default="")
    support_user_id: Mapped[str | None] = mapped_column(ForeignKey("admin_users.id"), nullable=True)
    technician_name: Mapped[str] = mapped_column(String(180), default="")
    technician_phone: Mapped[str] = mapped_column(String(40), default="")
    asset_ids: Mapped[list[str] | None] = mapped_column(JSON, default=list, nullable=True)
    previous_states: Mapped[dict[str, str] | None] = mapped_column(JSON, default=dict, nullable=True)
    is_repairable: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    workflow_type: Mapped[str] = mapped_column(String(30), default="Pendiente")
    replacement_asset_ids: Mapped[list[str] | None] = mapped_column(JSON, default=list, nullable=True)
    replacement_previous_states: Mapped[dict[str, str] | None] = mapped_column(JSON, default=dict, nullable=True)
    evidence_urls: Mapped[list[str] | None] = mapped_column(JSON, default=list, nullable=True)
    solution_description: Mapped[str | None] = mapped_column(Text, default="", nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    support_user: Mapped[AdminUser | None] = relationship()


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("admin_users.id"), nullable=True)
    username: Mapped[str] = mapped_column(String(80))
    module: Mapped[str] = mapped_column(String(40), index=True)
    action: Mapped[str] = mapped_column(String(30))
    element: Mapped[str] = mapped_column(String(160))
    detail: Mapped[str] = mapped_column(Text)
    ip_address: Mapped[str] = mapped_column(String(64), default="")
    device: Mapped[str] = mapped_column(String(500), default="")


class WebAsset(TimestampMixin, Base):
    __tablename__ = "web_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    section: Mapped[str] = mapped_column(String(30), index=True)
    service_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    file_url: Mapped[str] = mapped_column(String(500))
    mime_type: Mapped[str] = mapped_column(String(100))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Service(TimestampMixin, Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    title: Mapped[str] = mapped_column(String(180))
    category: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    features: Mapped[list[str]] = mapped_column(JSON, default=list)
    specs: Mapped[list[dict]] = mapped_column(JSON, default=list)
    ideal_for: Mapped[list[str]] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class ShippingGuide(TimestampMixin, Base):
    __tablename__ = "shipping_guides"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), unique=True, index=True)
    guide_number: Mapped[str] = mapped_column(String(30))
    transfer_date: Mapped[date] = mapped_column(Date)
    recipient_ruc: Mapped[str] = mapped_column(String(20), default="")
    recipient_document: Mapped[str] = mapped_column(String(20), default="")
    vehicle: Mapped[str] = mapped_column(String(200), default="")
    registration_certificate: Mapped[str] = mapped_column(String(100), default="")
    driver_license: Mapped[str] = mapped_column(String(100), default="")
    driver_document: Mapped[str] = mapped_column(String(20), default="")
    carrier: Mapped[str] = mapped_column(String(200), default="")
    carrier_ruc: Mapped[str] = mapped_column(String(20), default="")
    transfer_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    receipt_type: Mapped[str] = mapped_column(String(80), default="")
    receipt_number: Mapped[str] = mapped_column(String(80), default="")
    reasons: Mapped[list[str] | None] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(20), default="Borrador")
    items: Mapped[list["ShippingGuideItem"]] = relationship(cascade="all, delete-orphan", order_by="ShippingGuideItem.sort_order")


class ShippingGuideItem(Base):
    __tablename__ = "shipping_guide_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    guide_id: Mapped[str] = mapped_column(ForeignKey("shipping_guides.id", ondelete="CASCADE"), index=True)
    description: Mapped[str] = mapped_column(Text)
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    unit: Mapped[str] = mapped_column(String(20))
    notes: Mapped[str] = mapped_column(Text, default="")
    weight: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class SiteContent(TimestampMixin, Base):
    __tablename__ = "site_content"

    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    value: Mapped[dict | list] = mapped_column(JSON)


class FAQ(TimestampMixin, Base):
    __tablename__ = "faqs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    question: Mapped[str] = mapped_column(String(500))
    answer: Mapped[str] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
