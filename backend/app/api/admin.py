from datetime import UTC, date, datetime, timedelta
import csv
import io
import math
import re
import unicodedata
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import Response, StreamingResponse
from sqlalchemy import func, or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.app.api.dependencies import (
    require_any_module,
    require_module,
    require_super_admin,
)
from backend.app.api.public import faq_out, service_out, site_content_out, web_asset_out
from backend.app.core.audit_context import request_device, request_ip
from backend.app.core.config import get_settings
from backend.app.core.database import get_db
from backend.app.core.security import hash_password
from backend.app.models import (
    AdminUser,
    AuditLog,
    FAQ,
    InventoryAsset,
    InventoryCategory,
    InventoryState,
    Order,
    Service,
    ShippingGuide,
    ShippingGuideItem,
    SiteContent,
    SupportTicket,
    WebAsset,
    as_utc,
    utcnow,
)
from backend.app.schemas import (
    AdminUserCreate,
    AdminUserOut,
    AdminUserUpdate,
    AuditIn,
    AuditOut,
    CategoryIn,
    CategoryOut,
    DashboardOut,
    DerivedCustomerOut,
    InventoryIn,
    InventoryOut,
    PaginatedAuditOut,
    PaginatedInventoryOut,
    InventoryStateIn,
    InventoryStateOut,
    InventoryStateUpdate,
    OrderIn,
    OrderFinishOut,
    OrderOut,
    FAQIn,
    FAQOut,
    ServiceIn,
    ShippingGuideIn,
    ShippingGuideOut,
    SiteContentOut,
    SiteContentUpdate,
    SupportResponsibleOut,
    TicketIn,
    TicketDiagnosisIn,
    TicketOut,
    TicketResolveIn,
    TicketUpdate,
    WebAssetOut,
    WebAssetUpdate,
)


router = APIRouter(tags=["Panel administrativo"])


def conflict(db: Session, message: str) -> None:
    db.rollback()
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message)


def audit(db: Session, user: AdminUser, module: str, action: str, element: str, detail: str) -> None:
    retention = get_settings().audit_retention_days
    if retention > 0:
        db.query(AuditLog).filter(AuditLog.occurred_at < utcnow() - timedelta(days=retention)).delete()
    db.add(AuditLog(
        username=user.username,
        user_id=user.id,
        module=module,
        action=action,
        element=element,
        detail=detail,
        ip_address=request_ip.get(),
        device=request_device.get(),
    ))


def user_out(item: AdminUser) -> AdminUserOut:
    return AdminUserOut(id=item.id, nombre=item.full_name, email=item.email, usuario=item.username, rol=item.role, telefono=item.phone, activo=item.is_active, modulos=item.modules, superAdmin=item.is_super_admin, createdAt=as_utc(item.created_at))


def category_out(item: InventoryCategory) -> CategoryOut:
    return CategoryOut(
        id=item.id,
        label=item.label,
        codigo=item.code,
        iconName=item.icon_name,
        camposBase=item.base_fields or [],
        camposPersonalizados=item.custom_fields,
    )


def inventory_out(item: InventoryAsset) -> InventoryOut:
    return InventoryOut(
        id=item.id, categoriaId=item.category_id, categoria=item.category.code, sku=item.sku, qr=item.qr,
        foto=item.photo_url, item=item.item, marca=item.brand, descripcion=item.description,
        numeroSerial=item.serial_number, procesador=item.processor, ghz=item.ghz, generacion=item.generation,
        pantalla=item.screen, memoriaRam=item.ram, memoriaInterna=item.storage,
        tipoMemoriaInterna=item.storage_type, modelo=item.model, fechaCompra=item.purchase_date,
        facturaGuiaCompra=item.purchase_document, precio=item.price, proveedor=item.supplier,
        alquiler=item.rentable, estado=item.status, observaciones=item.notes,
        especificacionesPersonalizadas=item.custom_specs,
    )


def order_out(item: Order) -> OrderOut:
    return OrderOut(
        id=item.id,
        numeroPedido=item.order_number,
        fechaEmision=item.issue_date,
        direccionPartida=item.origin_address,
        direccionLlegada=item.destination_address,
        telefonoContacto=item.contact_phone,
        descripcionProductos=item.product_description,
        cantidadProductos=item.product_quantity,
        unidadMedida=item.unit,
        motivoTraslado=item.transfer_reason,
        observaciones=item.notes,
        skus=item.skus or [],
        estadoPedido=item.operational_status,
        fechaFinalizacion=as_utc(item.finalized_at) if item.finalized_at else None,
        estadosAnteriores=item.previous_states or {},
    )


def ticket_out(item: SupportTicket) -> TicketOut:
    return TicketOut(
        id=item.id,
        codigo=item.code,
        area=item.area,
        equipo=item.equipment,
        cliente=item.customer,
        prioridad=item.priority,
        estado=item.status,
        descripcion=item.description,
        numeroPedidoEstado=item.order_or_status,
        tipoTicket=item.ticket_type or None,
        numeroPedido=item.order_number,
        telefonoContacto=item.contact_phone,
        direccionPedido=item.order_address,
        estadoEquipo=item.equipment_status,
        tecnicoId=item.support_user_id,
        tecnico=item.technician_name,
        tecnicoTelefono=item.technician_phone,
        equiposIds=item.asset_ids or [],
        estadosAnteriores=item.previous_states or {},
        reparable=item.is_repairable,
        flujo=item.workflow_type,
        equiposReemplazoIds=item.replacement_asset_ids or [],
        evidencias=item.evidence_urls or [],
        descripcionSolucion=item.solution_description or "",
        fechaResolucion=as_utc(item.resolved_at) if item.resolved_at else None,
        fecha=as_utc(item.created_at),
    )


def audit_out(item: AuditLog) -> AuditOut:
    return AuditOut(
        id=item.id,
        fecha=as_utc(item.occurred_at),
        usuario=item.username,
        modulo=item.module,
        accion=item.action,
        elemento=item.element,
        detalle=item.detail,
        ip=item.ip_address,
        dispositivo=item.device,
    )


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(_: AdminUser = Depends(require_module("dashboard")), db: Session = Depends(get_db)) -> DashboardOut:
    by_status = dict(db.execute(select(InventoryAsset.status, func.count()).group_by(InventoryAsset.status)).all())
    orders = list(db.scalars(select(Order)).all())
    tickets_by_status = dict(db.execute(select(SupportTicket.status, func.count()).group_by(SupportTicket.status)).all())
    customer_orders: dict[str, bool] = {}
    for order in orders:
        name, _, _ = parse_order_destination(order.destination_address)
        key = normalize_customer_name(name)
        customer_orders[key] = customer_orders.get(key, False) or order.operational_status != "Finalizado"
    today = date.today()
    monthly: list[dict] = []
    for offset in range(5, -1, -1):
        month_index = today.month - 1 - offset
        year = today.year + month_index // 12
        month = month_index % 12 + 1
        rows = [order for order in orders if order.issue_date.year == year and order.issue_date.month == month]
        monthly.append({
            "periodo": f"{year}-{month:02d}",
            "alquiler": sum(order.product_quantity for order in rows if order.transfer_reason == "Alquiler"),
            "ventas": sum(order.product_quantity for order in rows if order.transfer_reason.startswith("Venta")),
        })
    recent = db.scalars(select(AuditLog).order_by(AuditLog.occurred_at.desc()).limit(10)).all()
    return DashboardOut(
        inventarioTotal=sum(by_status.values()),
        inventarioPorEstado=by_status,
        pedidosTotal=len(orders),
        pedidosActivos=sum(order.operational_status != "Finalizado" for order in orders),
        pedidosFinalizados=sum(order.operational_status == "Finalizado" for order in orders),
        ticketsPorEstado=tickets_by_status,
        clientesTotal=len(customer_orders),
        clientesActivos=sum(customer_orders.values()),
        clientesInactivos=sum(not active for active in customer_orders.values()),
        alquileresPorMes=monthly,
        movimientosRecientes=[audit_out(item) for item in recent],
    )


@router.get("/usuarios", response_model=list[AdminUserOut])
def list_users(_: AdminUser = Depends(require_super_admin), db: Session = Depends(get_db)) -> list[AdminUserOut]:
    return [user_out(item) for item in db.scalars(select(AdminUser).order_by(AdminUser.full_name)).all()]


@router.post("/usuarios", response_model=AdminUserOut, status_code=201)
def create_user(payload: AdminUserCreate, actor: AdminUser = Depends(require_super_admin), db: Session = Depends(get_db)) -> AdminUserOut:
    item = AdminUser(full_name=payload.nombre, email=payload.email.lower(), username=payload.usuario, password_hash=hash_password(payload.password), role=payload.rol, phone=payload.telefono, is_active=payload.activo, is_super_admin=payload.superAdmin, modules=payload.modulos)
    db.add(item)
    audit(db, actor, "Configuración", "Creó", payload.usuario, f"Creó la cuenta administrativa {payload.usuario}.")
    try:
        db.commit()
    except IntegrityError:
        conflict(db, "El correo o usuario ya está registrado")
    db.refresh(item)
    return user_out(item)


@router.patch("/usuarios/{user_id}", response_model=AdminUserOut)
def update_user(user_id: str, payload: AdminUserUpdate, actor: AdminUser = Depends(require_super_admin), db: Session = Depends(get_db)) -> AdminUserOut:
    item = db.get(AdminUser, user_id)
    if item is None:
        raise HTTPException(404, "Usuario no encontrado")
    changes = payload.model_dump(exclude_unset=True)
    if changes.get("activo") is False:
        if item.id == actor.id:
            raise HTTPException(400, "No puedes desactivar tu propia cuenta")
        if item.is_super_admin:
            remaining_superadmins = db.scalar(
                select(func.count())
                .select_from(AdminUser)
                .where(
                    AdminUser.is_super_admin.is_(True),
                    AdminUser.is_active.is_(True),
                    AdminUser.id != item.id,
                )
            ) or 0
            if remaining_superadmins == 0:
                raise HTTPException(400, "Debe quedar al menos un superadministrador activo")
    before = (item.email, item.username, item.password_hash, item.role, item.modules, item.is_active)
    if "nombre" in changes: item.full_name = changes["nombre"]
    if "email" in changes: item.email = changes["email"].lower()
    if "usuario" in changes: item.username = changes["usuario"]
    if "password" in changes: item.password_hash = hash_password(changes["password"])
    if "rol" in changes: item.role = changes["rol"]
    if "telefono" in changes: item.phone = changes["telefono"]
    if "activo" in changes: item.is_active = changes["activo"]
    if "modulos" in changes: item.modules = changes["modulos"]
    if before != (item.email, item.username, item.password_hash, item.role, item.modules, item.is_active):
        item.token_version += 1
    audit(db, actor, "Configuración", "Editó", item.username, f"Actualizó la cuenta {item.username}.")
    try:
        db.commit()
    except IntegrityError:
        conflict(db, "El correo o usuario ya está registrado")
    db.refresh(item)
    return user_out(item)


@router.delete("/usuarios/{user_id}", status_code=204)
def delete_user(user_id: str, actor: AdminUser = Depends(require_super_admin), db: Session = Depends(get_db)) -> None:
    item = db.get(AdminUser, user_id)
    if item is None:
        raise HTTPException(404, "Usuario no encontrado")
    if item.id == actor.id:
        raise HTTPException(400, "No puedes eliminar tu propia cuenta")
    if item.is_super_admin:
        total_superadmins = db.scalar(
            select(func.count()).select_from(AdminUser).where(AdminUser.is_super_admin.is_(True))
        ) or 0
        if total_superadmins <= 1:
            raise HTTPException(400, "No se puede eliminar el último superadministrador")

    db.execute(update(AuditLog).where(AuditLog.user_id == item.id).values(user_id=None))
    audit(db, actor, "Configuración", "Eliminó", item.username, f"Eliminó la cuenta {item.username}.")
    db.delete(item)
    db.commit()


@router.get("/inventario/categorias", response_model=list[CategoryOut])
def categories(_: AdminUser = Depends(require_any_module("dashboard", "inventario", "pedidos", "tickets")), db: Session = Depends(get_db)) -> list[CategoryOut]:
    return [category_out(item) for item in db.scalars(select(InventoryCategory).order_by(InventoryCategory.code)).all()]


@router.post("/inventario/categorias", response_model=CategoryOut, status_code=201)
def create_category(payload: CategoryIn, actor: AdminUser = Depends(require_module("inventario")), db: Session = Depends(get_db)) -> CategoryOut:
    item = InventoryCategory(
        id=payload.id,
        label=payload.label,
        code=payload.codigo,
        icon_name=payload.iconName,
        base_fields=payload.camposBase,
        custom_fields=[field.model_dump() for field in payload.camposPersonalizados],
    )
    db.add(item)
    audit(db, actor, "Inventario", "Agregó", payload.id, f"Agregó la categoría {payload.label}.")
    try: db.commit()
    except IntegrityError: conflict(db, "El id, nombre o código de categoría ya existe")
    return category_out(item)


@router.delete("/inventario/categorias/{category_id}", status_code=204)
def delete_category(
    category_id: str,
    actor: AdminUser = Depends(require_module("inventario")),
    db: Session = Depends(get_db),
) -> None:
    item = db.get(InventoryCategory, category_id)
    if item is None:
        raise HTTPException(404, "Categoría no encontrada")
    if db.scalar(select(func.count()).select_from(InventoryAsset).where(InventoryAsset.category_id == category_id)):
        raise HTTPException(409, "La categoría tiene activos registrados")
    audit(db, actor, "Inventario", "Eliminó", item.id, f"Eliminó la categoría {item.label}.")
    db.delete(item)
    db.commit()


def inventory_state_out(item: InventoryState) -> InventoryStateOut:
    return InventoryStateOut(nombre=item.name, inmutable=item.is_immutable, orden=item.sort_order)


@router.get("/inventario/estados", response_model=list[InventoryStateOut])
def inventory_states(
    _: AdminUser = Depends(require_any_module("dashboard", "inventario", "pedidos", "tickets")),
    db: Session = Depends(get_db),
) -> list[InventoryStateOut]:
    rows = db.scalars(select(InventoryState).order_by(InventoryState.sort_order, InventoryState.name)).all()
    return [inventory_state_out(item) for item in rows]


@router.post("/inventario/estados", response_model=InventoryStateOut, status_code=201)
def create_inventory_state(
    payload: InventoryStateIn,
    actor: AdminUser = Depends(require_module("inventario")),
    db: Session = Depends(get_db),
) -> InventoryStateOut:
    if db.get(InventoryState, payload.nombre) is not None:
        raise HTTPException(409, "Ese estado ya existe")
    order = db.scalar(select(func.max(InventoryState.sort_order))) or 0
    item = InventoryState(name=payload.nombre, sort_order=order + 1)
    db.add(item)
    audit(db, actor, "Inventario", "Agregó", payload.nombre, f"Agregó el estado {payload.nombre}.")
    db.commit()
    db.refresh(item)
    return inventory_state_out(item)


@router.patch("/inventario/estados/{state_name}", response_model=InventoryStateOut)
def update_inventory_state(
    state_name: str,
    payload: InventoryStateUpdate,
    actor: AdminUser = Depends(require_module("inventario")),
    db: Session = Depends(get_db),
) -> InventoryStateOut:
    item = db.get(InventoryState, state_name)
    if item is None:
        raise HTTPException(404, "Estado no encontrado")
    if item.is_immutable:
        raise HTTPException(409, "El estado es inmutable")
    if payload.nombre != state_name and db.get(InventoryState, payload.nombre) is not None:
        raise HTTPException(409, "Ese estado ya existe")
    replacement = InventoryState(
        name=payload.nombre,
        is_immutable=False,
        sort_order=item.sort_order,
        created_at=item.created_at,
    )
    db.add(replacement)
    db.flush()
    db.execute(update(InventoryAsset).where(InventoryAsset.status == state_name).values(status=payload.nombre))
    for order in db.scalars(select(Order)).all():
        states = order.previous_states or {}
        if state_name in states.values():
            order.previous_states = {
                asset_id: payload.nombre if value == state_name else value
                for asset_id, value in states.items()
            }
    for ticket in db.scalars(select(SupportTicket)).all():
        states = ticket.previous_states or {}
        if state_name in states.values():
            ticket.previous_states = {
                asset_id: payload.nombre if value == state_name else value
                for asset_id, value in states.items()
            }
    db.delete(item)
    audit(db, actor, "Inventario", "Editó", state_name, f"Renombró el estado {state_name} a {payload.nombre}.")
    db.commit()
    return inventory_state_out(replacement)


@router.delete("/inventario/estados/{state_name}", status_code=204)
def delete_inventory_state(
    state_name: str,
    actor: AdminUser = Depends(require_module("inventario")),
    db: Session = Depends(get_db),
) -> None:
    item = db.get(InventoryState, state_name)
    if item is None:
        raise HTTPException(404, "Estado no encontrado")
    if item.is_immutable:
        raise HTTPException(409, "El estado es inmutable")
    if db.scalar(select(func.count()).select_from(InventoryAsset).where(InventoryAsset.status == state_name)):
        raise HTTPException(409, "El estado está en uso")
    if any(state_name in (order.previous_states or {}).values() for order in db.scalars(select(Order)).all()):
        raise HTTPException(409, "El estado está referenciado por un pedido")
    if any(state_name in (ticket.previous_states or {}).values() for ticket in db.scalars(select(SupportTicket)).all()):
        raise HTTPException(409, "El estado está referenciado por un ticket")
    audit(db, actor, "Inventario", "Eliminó", state_name, f"Eliminó el estado {state_name}.")
    db.delete(item)
    db.commit()


@router.get("/inventario", response_model=PaginatedInventoryOut)
def inventory(
    category_id: str | None = None,
    estado: str | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=1000),
    _: AdminUser = Depends(require_any_module("dashboard", "inventario", "pedidos", "tickets")),
    db: Session = Depends(get_db),
) -> PaginatedInventoryOut:
    query = select(InventoryAsset).join(InventoryCategory)
    if category_id: query = query.where(InventoryAsset.category_id == category_id)
    if estado: query = query.where(InventoryAsset.status == estado)
    if search:
        term = f"%{search}%"
        query = query.where(InventoryAsset.sku.like(term) | InventoryAsset.serial_number.like(term) | InventoryAsset.description.like(term) | InventoryAsset.brand.like(term))
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(InventoryAsset.sku).offset((page - 1) * page_size).limit(page_size)).all()
    return PaginatedInventoryOut(items=[inventory_out(item) for item in rows], total=total, page=page, pageSize=page_size, pages=max(1, math.ceil(total / page_size)))


@router.post("/inventario/fotos", status_code=201)
async def upload_inventory_photo(
    file: UploadFile = File(...),
    _: AdminUser = Depends(require_module("inventario")),
) -> dict[str, str]:
    allowed = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif"}
    content_type = file.content_type or ""
    extension = allowed.get(content_type)
    if extension is None:
        raise HTTPException(415, "Formato de foto no permitido")
    settings = get_settings(); limit = settings.max_upload_mb * 1024 * 1024
    directory = Path(settings.upload_directory) / "inventory"; directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{uuid4().hex}{extension}"; total = 0
    try:
        with path.open("wb") as destination:
            while chunk := await file.read(1024 * 1024):
                total += len(chunk)
                if total > limit: raise HTTPException(413, f"La foto supera el límite de {settings.max_upload_mb} MB")
                destination.write(chunk)
    except Exception:
        path.unlink(missing_ok=True); raise
    finally:
        await file.close()
    return {"url": f"{settings.public_upload_url.rstrip('/')}/inventory/{path.name}"}


def remove_inventory_photo(url: str) -> None:
    marker = "/inventory/"
    if marker not in url:
        return
    filename = Path(url).name
    (Path(get_settings().upload_directory) / "inventory" / filename).unlink(missing_ok=True)


def apply_inventory(item: InventoryAsset, payload: InventoryIn) -> None:
    item.category_id = payload.categoriaId; item.sku = payload.sku; item.qr = payload.qr; item.photo_url = payload.foto
    item.item = payload.item; item.brand = payload.marca; item.description = payload.descripcion; item.serial_number = payload.numeroSerial
    item.processor = payload.procesador; item.ghz = payload.ghz; item.generation = payload.generacion; item.screen = payload.pantalla
    item.ram = payload.memoriaRam; item.storage = payload.memoriaInterna; item.storage_type = payload.tipoMemoriaInterna; item.model = payload.modelo
    item.purchase_date = payload.fechaCompra; item.purchase_document = payload.facturaGuiaCompra; item.price = payload.precio
    rentable = payload.alquiler
    if isinstance(rentable, str):
        rentable = rentable.strip().lower() in {"sí", "si", "true", "1", "yes"}
    item.supplier = payload.proveedor; item.rentable = rentable; item.status = payload.estado; item.notes = payload.observaciones
    item.custom_specs = payload.especificacionesPersonalizadas


@router.post("/inventario", response_model=InventoryOut, status_code=201)
def create_inventory(payload: InventoryIn, actor: AdminUser = Depends(require_module("inventario")), db: Session = Depends(get_db)) -> InventoryOut:
    if db.get(InventoryCategory, payload.categoriaId) is None: raise HTTPException(422, "Categoría inexistente")
    if db.get(InventoryState, payload.estado) is None: raise HTTPException(422, "Estado de inventario inexistente")
    item = InventoryAsset(); apply_inventory(item, payload); db.add(item)
    audit(db, actor, "Inventario", "Agregó", payload.sku, f"Agregó el producto {payload.sku} · {payload.descripcion}.")
    try: db.commit()
    except IntegrityError: conflict(db, "El SKU, QR o número serial ya está registrado")
    db.refresh(item); return inventory_out(item)


@router.put("/inventario/{item_id}", response_model=InventoryOut)
def update_inventory(item_id: str, payload: InventoryIn, actor: AdminUser = Depends(require_module("inventario")), db: Session = Depends(get_db)) -> InventoryOut:
    item = db.get(InventoryAsset, item_id)
    if item is None: raise HTTPException(404, "Activo no encontrado")
    if db.get(InventoryCategory, payload.categoriaId) is None: raise HTTPException(422, "Categoría inexistente")
    if db.get(InventoryState, payload.estado) is None: raise HTTPException(422, "Estado de inventario inexistente")
    old_photo = item.photo_url
    apply_inventory(item, payload); audit(db, actor, "Inventario", "Modificó", payload.sku, f"Modificó el producto {payload.sku}.")
    try: db.commit()
    except IntegrityError: conflict(db, "El SKU, QR o número serial ya está registrado")
    db.refresh(item)
    if old_photo != item.photo_url: remove_inventory_photo(old_photo)
    return inventory_out(item)


@router.delete("/inventario/{item_id}", status_code=204)
def delete_inventory(item_id: str, actor: AdminUser = Depends(require_module("inventario")), db: Session = Depends(get_db)) -> None:
    item = db.get(InventoryAsset, item_id)
    if item is None: raise HTTPException(404, "Activo no encontrado")
    if any(item_id in (order.previous_states or {}) for order in db.scalars(select(Order).where(Order.operational_status == "Activo")).all()):
        raise HTTPException(409, "El activo pertenece a un pedido activo")
    if any(item_id in (ticket.asset_ids or []) for ticket in db.scalars(select(SupportTicket).where(SupportTicket.status != "Resuelto")).all()):
        raise HTTPException(409, "El activo pertenece a un ticket activo")
    photo = item.photo_url
    audit(db, actor, "Inventario", "Eliminó", item.sku, f"Eliminó el producto {item.sku}."); db.delete(item); db.commit()
    remove_inventory_photo(photo)


def normalize_customer_name(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    return " ".join("".join(char for char in normalized if not unicodedata.combining(char)).lower().split())


def parse_order_destination(value: str) -> tuple[str, str, str]:
    parts = [part.strip() for part in value.split(" · ")]
    first = parts[0] if parts else ""
    customer_type = "Persona natural" if first.lower().startswith("persona natural:") else "Empresa"
    name = re.sub(r"^(Empresa|Persona natural|Persona jurídica):\s*", "", first, flags=re.IGNORECASE).strip()
    fields: dict[str, str] = {}
    for part in parts[1:]:
        if ":" in part:
            key, content = part.split(":", 1)
            fields[key.lower()] = content.strip()
    location = ", ".join(dict.fromkeys(filter(None, [fields.get("distrito"), fields.get("provincia"), fields.get("departamento")])))
    return name or "Cliente sin identificar", customer_type, location or fields.get("dirección", "")


@router.get("/clientes/derivados", response_model=list[DerivedCustomerOut])
def derived_customers(
    _: AdminUser = Depends(require_any_module("dashboard", "clientes", "pedidos", "tickets")),
    db: Session = Depends(get_db),
) -> list[DerivedCustomerOut]:
    rows = db.scalars(select(Order).order_by(Order.issue_date.desc(), Order.order_number.desc())).all()
    accumulated: dict[str, dict] = {}
    for order in rows:
        name, customer_type, location = parse_order_destination(order.destination_address)
        key = normalize_customer_name(name)
        current = accumulated.get(key)
        active = order.operational_status != "Finalizado"
        if current is None:
            accumulated[key] = {
                "name": name,
                "type": customer_type,
                "phone": order.contact_phone,
                "location": location,
                "orders": 1,
                "active": int(active),
                "last": order.issue_date,
                "numbers": [order.order_number],
            }
            continue
        current["orders"] += 1
        current["active"] += int(active)
        current["numbers"].append(order.order_number)

    output: list[DerivedCustomerOut] = []
    used_ids: set[str] = set()
    for data in accumulated.values():
        base = re.sub(r"[^a-z0-9]+", "-", normalize_customer_name(data["name"])).strip("-") or "cliente-sin-identificar"
        customer_id = base
        suffix = 2
        while customer_id in used_ids:
            customer_id = f"{base}-{suffix}"
            suffix += 1
        used_ids.add(customer_id)
        output.append(DerivedCustomerOut(
            id=customer_id,
            nombre=data["name"],
            tipo=data["type"],
            telefono=data["phone"],
            ubicacion=data["location"],
            pedidos=data["orders"],
            pedidosVigentes=data["active"],
            ultimaActividad=data["last"],
            estado="Activo" if data["active"] else "Inactivo",
            numerosPedido=sorted(set(data["numbers"])),
        ))
    return sorted(output, key=lambda customer: (customer.ultimaActividad, customer.nombre), reverse=True)


@router.get("/pedidos", response_model=list[OrderOut])
def orders(_: AdminUser = Depends(require_any_module("dashboard", "pedidos", "clientes", "tickets")), db: Session = Depends(get_db)) -> list[OrderOut]:
    return [order_out(item) for item in db.scalars(select(Order).order_by(Order.issue_date.desc(), Order.order_number.desc())).all()]


def next_order_number(db: Session) -> str:
    year = date.today().year
    prefix = f"PED-{year}-"
    latest = db.scalar(select(Order.order_number).where(Order.order_number.like(f"{prefix}%")).order_by(Order.order_number.desc()).limit(1))
    sequence = int(latest.rsplit("-", 1)[-1]) + 1 if latest else 1
    return f"{prefix}{sequence:03d}"


def apply_order(item: Order, payload: OrderIn) -> None:
    item.issue_date=payload.fechaEmision; item.origin_address=payload.direccionPartida; item.destination_address=payload.direccionLlegada; item.contact_phone=payload.telefonoContacto; item.product_description=payload.descripcionProductos; item.product_quantity=payload.cantidadProductos; item.unit=payload.unidadMedida; item.transfer_reason=payload.motivoTraslado; item.notes=payload.observaciones; item.skus=payload.skus


def order_target_state(reason: str) -> str | None:
    if reason == "Alquiler":
        return "Alquiler"
    if reason.startswith("Venta"):
        return "Venta"
    return None


def restore_order_assets(item: Order, db: Session, *, deleting: bool = False) -> int:
    if item.operational_status == "Finalizado" and item.transfer_reason == "Alquiler":
        return 0
    expected = order_target_state(item.transfer_reason)
    if expected is None:
        return 0
    restored = 0
    for asset_id, previous in (item.previous_states or {}).items():
        asset = db.get(InventoryAsset, asset_id)
        if asset is not None and asset.status == expected:
            asset.status = previous
            restored += 1
    return restored


def rebase_tickets_after_order_release(item: Order, db: Session) -> None:
    assigned = order_target_state(item.transfer_reason)
    if assigned is None:
        return
    active_tickets = db.scalars(select(SupportTicket).where(SupportTicket.status != "Resuelto")).all()
    for ticket in active_tickets:
        states = dict(ticket.previous_states or {})
        changed = False
        for asset_id, original in (item.previous_states or {}).items():
            if states.get(asset_id) == assigned:
                states[asset_id] = original
                changed = True
        if changed:
            ticket.previous_states = states


def reserve_order_assets(payload: OrderIn, db: Session, *, exclude_order_id: str | None = None) -> dict[str, str]:
    target = order_target_state(payload.motivoTraslado)
    if target is None:
        return {}
    selected_skus = {sku.strip().upper() for sku in payload.skus if sku.strip()}
    if not selected_skus:
        # Compatibilidad con pedidos históricos creados antes de seleccionar
        # activos por SKU. El panel actual siempre envía esta lista.
        return {}
    assets = list(db.scalars(select(InventoryAsset).where(func.upper(InventoryAsset.sku).in_(selected_skus))).all())
    if len(assets) != len(selected_skus):
        found = {asset.sku.upper() for asset in assets}
        missing = ", ".join(sorted(selected_skus - found))
        raise HTTPException(422, f"Los siguientes SKU no existen: {missing}")

    active_orders = db.scalars(select(Order).where(Order.operational_status == "Activo")).all()
    occupied = {
        asset_id
        for order in active_orders
        if order.id != exclude_order_id
        for asset_id in (order.previous_states or {})
    }
    if any(asset.id in occupied for asset in assets):
        raise HTTPException(409, "Uno de los equipos ya está asignado a otro pedido activo")

    active_tickets = db.scalars(select(SupportTicket).where(SupportTicket.status != "Resuelto")).all()
    ticket_assets = {asset_id for ticket in active_tickets for asset_id in (ticket.asset_ids or [])}
    if any(asset.id in ticket_assets for asset in assets):
        raise HTTPException(409, "Uno de los equipos tiene un ticket de soporte activo")

    previous = {asset.id: asset.status for asset in assets}
    for asset in assets:
        asset.status = target
    return previous


@router.post("/pedidos", response_model=OrderOut, status_code=201)
def create_order(payload: OrderIn, actor: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> OrderOut:
    previous = reserve_order_assets(payload, db)
    item=Order(order_number=next_order_number(db), previous_states=previous); apply_order(item,payload); db.add(item); audit(db,actor,"Pedidos","Creó",item.order_number,f"Creó el pedido {item.order_number}.")
    try: db.commit()
    except IntegrityError: conflict(db,"No se pudo asignar el correlativo; vuelva a intentarlo")
    db.refresh(item); return order_out(item)


@router.put("/pedidos/{item_id}", response_model=OrderOut)
def update_order(item_id: str, payload: OrderIn, actor: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> OrderOut:
    item=db.get(Order,item_id)
    if item is None: raise HTTPException(404,"Pedido no encontrado")
    if item.operational_status == "Finalizado": raise HTTPException(409,"No se puede editar un pedido finalizado")
    restore_order_assets(item, db)
    item.previous_states = reserve_order_assets(payload, db, exclude_order_id=item.id)
    apply_order(item,payload); audit(db,actor,"Pedidos","Editó",item.order_number,f"Editó el pedido {item.order_number}."); db.commit(); db.refresh(item); return order_out(item)


@router.patch("/pedidos/{item_id}/finalizar", response_model=OrderFinishOut)
def finish_order(item_id: str, actor: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> OrderFinishOut:
    item = db.get(Order, item_id)
    if item is None: raise HTTPException(404, "Pedido no encontrado")
    if item.operational_status == "Finalizado": raise HTTPException(409, "El pedido ya está finalizado")
    restored = restore_order_assets(item, db)
    rebase_tickets_after_order_release(item, db)
    item.operational_status = "Finalizado"
    item.finalized_at = utcnow()
    audit(db, actor, "Pedidos", "Modificó", item.order_number, f"Finalizó el pedido {item.order_number}.")
    db.commit(); db.refresh(item)
    return OrderFinishOut(pedido=order_out(item), inventarioActualizado=restored)


@router.delete("/pedidos/{item_id}", status_code=204)
def delete_order(item_id: str, actor: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> None:
    item=db.get(Order,item_id)
    if item is None: raise HTTPException(404,"Pedido no encontrado")
    restore_order_assets(item, db, deleting=True)
    if not (item.operational_status == "Finalizado" and item.transfer_reason == "Alquiler"):
        rebase_tickets_after_order_release(item, db)
    audit(db,actor,"Pedidos","Eliminó",item.order_number,f"Eliminó el pedido {item.order_number}."); db.delete(item); db.commit()


def guide_out(item: ShippingGuide) -> ShippingGuideOut:
    return ShippingGuideOut(
        id=item.id, pedidoId=item.order_id, numeroGuia=item.guide_number, fechaTraslado=item.transfer_date,
        destinatarioRuc=item.recipient_ruc, destinatarioDocumento=item.recipient_document,
        vehiculo=item.vehicle, certificado=item.registration_certificate, licencia=item.driver_license,
        conductorDocumento=item.driver_document, transportista=item.carrier, transportistaRuc=item.carrier_ruc,
        costoTraslado=item.transfer_cost, comprobanteTipo=item.receipt_type, comprobanteNumero=item.receipt_number,
        motivos=item.reasons or [], estado=item.status,
        bienes=[{"descripcion": row.description, "cantidad": row.quantity, "unidad": row.unit, "observaciones": row.notes, "peso": row.weight} for row in item.items],
        updatedAt=as_utc(item.updated_at),
    )


def apply_guide(item: ShippingGuide, payload: ShippingGuideIn, db: Session) -> None:
    item.guide_number=payload.numeroGuia; item.transfer_date=payload.fechaTraslado; item.recipient_ruc=payload.destinatarioRuc
    item.recipient_document=payload.destinatarioDocumento; item.vehicle=payload.vehiculo; item.registration_certificate=payload.certificado
    item.driver_license=payload.licencia; item.driver_document=payload.conductorDocumento; item.carrier=payload.transportista
    item.carrier_ruc=payload.transportistaRuc; item.transfer_cost=payload.costoTraslado; item.receipt_type=payload.comprobanteTipo
    item.receipt_number=payload.comprobanteNumero; item.reasons=payload.motivos; item.status=payload.estado
    item.items.clear()
    for index, row in enumerate(payload.bienes):
        item.items.append(ShippingGuideItem(description=row.descripcion, quantity=row.cantidad, unit=row.unidad, notes=row.observaciones, weight=row.peso, sort_order=index))


@router.get("/pedidos/{item_id}/guia", response_model=ShippingGuideOut)
def get_shipping_guide(item_id: str, _: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> ShippingGuideOut:
    item = db.scalar(select(ShippingGuide).where(ShippingGuide.order_id == item_id))
    if item is None: raise HTTPException(404, "Guía no encontrada")
    return guide_out(item)


@router.post("/pedidos/{item_id}/guia", response_model=ShippingGuideOut, status_code=201)
def create_shipping_guide(item_id: str, payload: ShippingGuideIn, actor: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> ShippingGuideOut:
    order = db.get(Order, item_id)
    if order is None: raise HTTPException(404, "Pedido no encontrado")
    if db.scalar(select(ShippingGuide).where(ShippingGuide.order_id == item_id)) is not None: raise HTTPException(409, "El pedido ya tiene una guía")
    item = ShippingGuide(order_id=item_id, guide_number=payload.numeroGuia, transfer_date=payload.fechaTraslado)
    apply_guide(item, payload, db); db.add(item)
    audit(db, actor, "Pedidos", "Guardó", f"Guía {payload.numeroGuia}", f"Guardó la guía del pedido {order.order_number}.")
    db.commit(); db.refresh(item); return guide_out(item)


@router.put("/pedidos/{item_id}/guia", response_model=ShippingGuideOut)
def update_shipping_guide(item_id: str, payload: ShippingGuideIn, actor: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> ShippingGuideOut:
    item = db.scalar(select(ShippingGuide).where(ShippingGuide.order_id == item_id))
    if item is None: raise HTTPException(404, "Guía no encontrada")
    apply_guide(item, payload, db)
    audit(db, actor, "Pedidos", "Editó", f"Guía {payload.numeroGuia}", "Actualizó la guía de remisión.")
    db.commit(); db.refresh(item); return guide_out(item)


@router.delete("/pedidos/{item_id}/guia", status_code=204)
def delete_shipping_guide(item_id: str, actor: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> None:
    item = db.scalar(select(ShippingGuide).where(ShippingGuide.order_id == item_id))
    if item is None: raise HTTPException(404, "Guía no encontrada")
    audit(db, actor, "Pedidos", "Eliminó", f"Guía {item.guide_number}", "Eliminó la guía de remisión.")
    db.delete(item); db.commit()


@router.get("/pedidos/{item_id}/guia/pdf")
def shipping_guide_pdf(item_id: str, _: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> Response:
    item = db.scalar(select(ShippingGuide).where(ShippingGuide.order_id == item_id))
    if item is None: raise HTTPException(404, "Guía no encontrada")
    order = db.get(Order, item_id)
    lines = ["AD GLOBAL SOLUTIONS SAC", "GUÍA DE REMISIÓN - REMITENTE", f"N° 0001-{item.guide_number}", f"Pedido: {order.order_number if order else item_id}", f"Fecha de traslado: {item.transfer_date}", f"Transportista: {item.carrier}  RUC: {item.carrier_ruc}", f"Vehículo: {item.vehicle}", "", "BIENES TRASLADADOS"]
    lines.extend(f"{row.quantity} {row.unit} | {row.description} | {row.weight} kg | {row.notes}" for row in item.items)
    lines.extend(["", f"Motivos: {', '.join(item.reasons or [])}", f"Estado: {item.status}"])
    return Response(simple_pdf(lines), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=guia-{item.guide_number}.pdf"})


@router.get("/usuarios/soporte", response_model=list[SupportResponsibleOut])
def support_responsibles(
    user: AdminUser = Depends(require_module("tickets")),
    db: Session = Depends(get_db),
) -> list[SupportResponsibleOut]:
    support_users = list(
        db.scalars(
            select(AdminUser)
            .where(AdminUser.role == "Soporte", AdminUser.is_active.is_(True))
            .order_by(AdminUser.full_name)
        ).all()
    )
    if user.role == "Soporte":
        support_users.sort(key=lambda item: item.id != user.id)
    return [
        SupportResponsibleOut(
            id=item.id,
            nombre=item.full_name,
            telefono=item.phone,
            email=item.email,
        )
        for item in support_users
    ]


@router.get("/tickets", response_model=list[TicketOut])
def tickets(_: AdminUser = Depends(require_module("tickets")), db: Session = Depends(get_db)) -> list[TicketOut]:
    return [ticket_out(item) for item in db.scalars(select(SupportTicket).order_by(SupportTicket.created_at.desc())).all()]


def next_ticket_code(db: Session) -> str:
    year=date.today().year; prefix=f"TKT-{year}-"; latest=db.scalar(select(SupportTicket.code).where(SupportTicket.code.like(f"{prefix}%")).order_by(SupportTicket.code.desc()).limit(1)); seq=int(latest.rsplit("-",1)[-1])+1 if latest else 1; return f"{prefix}{seq:03d}"


def restore_ticket_assets(item: SupportTicket, db: Session) -> int:
    if item.status == "Resuelto":
        return 0
    restored = 0
    for asset_id, previous in (item.previous_states or {}).items():
        asset = db.get(InventoryAsset, asset_id)
        if asset is not None and asset.status in {"Diagnóstico", "Reparación", "Reemplazo requerido"}:
            asset.status = previous
            restored += 1
    for asset_id, previous in (item.replacement_previous_states or {}).items():
        asset = db.get(InventoryAsset, asset_id)
        if asset is not None and asset.status == "Reservado para reemplazo":
            asset.status = previous
            restored += 1
    return restored


@router.post("/tickets", response_model=TicketOut, status_code=201)
def create_ticket(payload: TicketIn, actor: AdminUser = Depends(require_module("tickets")), db: Session = Depends(get_db)) -> TicketOut:
    support_user: AdminUser | None = None

    if payload.tecnicoId:
        support_id = payload.tecnicoId.removeprefix("soporte:")
        support_user = db.get(AdminUser, support_id)
        if support_user and (support_user.role != "Soporte" or not support_user.is_active):
            support_user = None
        if support_user is None:
            raise HTTPException(422, "El usuario de soporte no existe o está inactivo")

    technician_name = (
        support_user.full_name
        if support_user
        else payload.tecnico
    )
    technician_phone = (
        support_user.phone
        if support_user
        else payload.tecnicoTelefono
    )

    if payload.equiposIds:
        raise HTTPException(422, "Selecciona los equipos afectados desde Gestionar flujo")
    assets = [db.get(InventoryAsset, asset_id) for asset_id in payload.equiposIds]
    if any(asset is None for asset in assets):
        raise HTTPException(422, "Uno de los equipos seleccionados no existe")
    if payload.tipoTicket == "pedido":
        order = db.scalar(select(Order).where(Order.order_number == payload.numeroPedido))
        if order is None or order.operational_status == "Finalizado":
            raise HTTPException(422, "El pedido no existe o ya fue finalizado")
        assigned = set((order.previous_states or {}).keys())
        if any(asset_id not in assigned for asset_id in payload.equiposIds):
            raise HTTPException(422, "Uno de los equipos no pertenece al pedido activo")
    if payload.tipoTicket == "general" and any(asset is not None and asset.status != payload.estadoEquipo for asset in assets):
        raise HTTPException(422, "Uno de los equipos ya no pertenece al estado seleccionado")
    active_tickets = db.scalars(select(SupportTicket).where(SupportTicket.status != "Resuelto")).all()
    occupied = {asset_id for ticket in active_tickets for asset_id in (ticket.asset_ids or [])}
    if any(asset_id in occupied for asset_id in payload.equiposIds):
        raise HTTPException(409, "Uno de los equipos ya tiene un ticket activo")
    previous_states = {asset.id: asset.status for asset in assets if asset is not None}
    for asset in assets:
        if asset is not None:
            asset.status = "Diagnóstico"

    item = SupportTicket(
        code=next_ticket_code(db),
        area=payload.area,
        equipment="Pendiente de selección",
        customer=payload.cliente,
        priority=payload.prioridad,
        description=payload.descripcion,
        order_or_status=payload.numeroPedidoEstado,
        ticket_type=payload.tipoTicket or "",
        order_number=payload.numeroPedido,
        contact_phone=payload.telefonoContacto,
        order_address=payload.direccionPedido,
        equipment_status=payload.estadoEquipo,
        support_user_id=support_user.id if support_user else None,
        technician_name=technician_name,
        technician_phone=technician_phone,
        asset_ids=payload.equiposIds,
        previous_states=previous_states,
        workflow_type="Pendiente",
    )
    db.add(item)
    audit(db, actor, "Tickets", "Creó", item.code, f"Creó un ticket para {item.customer}.")
    try:
        db.commit()
    except IntegrityError:
        conflict(db, "No se pudo asignar el correlativo; vuelva a intentarlo")
    db.refresh(item)
    return ticket_out(item)


@router.patch("/tickets/{item_id}", response_model=TicketOut)
def update_ticket(item_id: str, payload: TicketUpdate, actor: AdminUser = Depends(require_module("tickets")), db: Session = Depends(get_db)) -> TicketOut:
    item=db.get(SupportTicket,item_id)
    if item is None: raise HTTPException(404,"Ticket no encontrado")
    changes=payload.model_dump(exclude_unset=True)
    if "estado" in changes:
        raise HTTPException(422, "Usa el flujo de diagnóstico y resolución del ticket")
    for source,target in (("area","area"),("prioridad","priority"),("descripcion","description")):
        if source in changes: setattr(item,target,changes[source])
    if "tecnicoId" in changes:
        support_id = changes["tecnicoId"].removeprefix("soporte:") if changes["tecnicoId"] else None
        support = db.get(AdminUser, support_id) if support_id else None
        if support is not None and (support.role != "Soporte" or not support.is_active):
            raise HTTPException(422, "El usuario de soporte no existe o está inactivo")
        item.support_user_id=support.id if support else None; item.technician_name=support.full_name if support else ""; item.technician_phone=support.phone if support else ""
    audit(db,actor,"Tickets","Editó",item.code,f"Actualizó el ticket {item.code}."); db.commit(); return ticket_out(item)


@router.post("/tickets/evidencias", status_code=201)
async def upload_ticket_evidence(
    file: UploadFile = File(...),
    _: AdminUser = Depends(require_module("tickets")),
) -> dict[str, str]:
    allowed = {
        "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif",
        "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov",
    }
    content_type = file.content_type or ""; extension = allowed.get(content_type)
    if extension is None: raise HTTPException(415, "Formato de evidencia no permitido")
    settings = get_settings(); is_video = content_type.startswith("video/")
    limit = (settings.max_video_upload_mb if is_video else settings.max_upload_mb) * 1024 * 1024
    directory = Path(settings.upload_directory) / "tickets"; directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{uuid4().hex}{extension}"; total = 0
    try:
        with path.open("wb") as destination:
            while chunk := await file.read(1024 * 1024):
                total += len(chunk)
                if total > limit: raise HTTPException(413, "La evidencia supera el límite permitido")
                destination.write(chunk)
    except Exception:
        path.unlink(missing_ok=True); raise
    finally:
        await file.close()
    return {"url": f"{settings.public_upload_url.rstrip('/')}/tickets/{path.name}"}


def restore_replacement_reservations(item: SupportTicket, db: Session) -> None:
    for asset_id, previous in (item.replacement_previous_states or {}).items():
        asset = db.get(InventoryAsset, asset_id)
        if asset is not None and asset.status == "Reservado para reemplazo":
            asset.status = previous


@router.post("/tickets/{item_id}/diagnostico", response_model=TicketOut)
def diagnose_ticket(
    item_id: str,
    payload: TicketDiagnosisIn,
    actor: AdminUser = Depends(require_module("tickets")),
    db: Session = Depends(get_db),
) -> TicketOut:
    item = db.get(SupportTicket, item_id)
    if item is None: raise HTTPException(404, "Ticket no encontrado")
    if item.status == "Resuelto": raise HTTPException(409, "El ticket ya está resuelto")
    if len(set(payload.equiposAfectadosIds)) != len(payload.equiposAfectadosIds):
        raise HTTPException(422, "No puedes repetir un equipo afectado")
    restore_ticket_assets(item, db)
    item.replacement_asset_ids = []; item.replacement_previous_states = {}
    affected = [db.get(InventoryAsset, asset_id) for asset_id in payload.equiposAfectadosIds]
    if any(asset is None for asset in affected): raise HTTPException(422, "Uno de los equipos afectados no existe")
    active_tickets = db.scalars(select(SupportTicket).where(SupportTicket.status != "Resuelto", SupportTicket.id != item.id)).all()
    occupied = {asset_id for ticket in active_tickets for asset_id in ((ticket.asset_ids or []) + (ticket.replacement_asset_ids or []))}
    if any(asset_id in occupied for asset_id in payload.equiposAfectadosIds): raise HTTPException(409, "Un equipo afectado pertenece a otro ticket activo")
    if item.ticket_type == "pedido":
        order = db.scalar(select(Order).where(Order.order_number == item.order_number, Order.operational_status == "Activo"))
        if order is None: raise HTTPException(409, "El pedido ya no está activo")
        assigned = set((order.previous_states or {}).keys())
        if any(asset_id not in assigned for asset_id in payload.equiposAfectadosIds): raise HTTPException(422, "Uno de los equipos no pertenece al pedido")
        if payload.reparable is None: raise HTTPException(422, "Indica si los equipos son reparables")
    elif any(asset is not None and asset.status != item.equipment_status for asset in affected):
        raise HTTPException(422, "Uno de los equipos ya no pertenece al estado seleccionado")

    item.asset_ids = payload.equiposAfectadosIds
    item.previous_states = {asset.id: asset.status for asset in affected if asset is not None}
    item.equipment = "; ".join(f"{asset.sku} — {asset.description}" for asset in affected if asset is not None)

    if item.ticket_type == "general":
        for asset in affected:
            if asset is not None: asset.status = "Diagnóstico"
        item.is_repairable = None; item.workflow_type = "General"; item.status = "En Diagnóstico"
    elif payload.reparable:
        for asset in affected:
            if asset is not None: asset.status = "Reparación"
        item.is_repairable = True; item.workflow_type = "Reparación"; item.status = "En Reparación"
    else:
        if len(payload.equiposReemplazoIds) != len(payload.equiposAfectadosIds):
            raise HTTPException(422, "Selecciona un equipo de reemplazo por cada equipo afectado")
        if len(set(payload.equiposReemplazoIds)) != len(payload.equiposReemplazoIds):
            raise HTTPException(422, "No puedes repetir un equipo de reemplazo")
        if set(payload.equiposReemplazoIds).intersection(payload.equiposAfectadosIds):
            raise HTTPException(422, "Un equipo afectado no puede ser su propio reemplazo")
        replacements = [db.get(InventoryAsset, asset_id) for asset_id in payload.equiposReemplazoIds]
        if any(asset is None for asset in replacements): raise HTTPException(422, "Uno de los reemplazos no existe")
        unavailable = {"Alquiler", "Venta", "Diagnóstico", "Reparación", "Reemplazo requerido", "Reservado para reemplazo", "Baja"}
        if any(asset.status in unavailable for asset in replacements if asset is not None):
            raise HTTPException(409, "Uno de los equipos de reemplazo no está disponible")
        if any(asset_id in occupied for asset_id in payload.equiposReemplazoIds): raise HTTPException(409, "Un reemplazo pertenece a otro ticket activo")
        previous = {asset.id: asset.status for asset in replacements if asset is not None}
        for asset in affected:
            if asset is not None: asset.status = "Reemplazo requerido"
        for asset in replacements:
            if asset is not None: asset.status = "Reservado para reemplazo"
        item.is_repairable = False; item.workflow_type = "Reemplazo"; item.status = "En Reemplazo"
        item.replacement_asset_ids = payload.equiposReemplazoIds; item.replacement_previous_states = previous
    audit(db, actor, "Tickets", "Modificó", item.code, f"Diagnóstico: flujo {item.workflow_type}.")
    db.commit(); db.refresh(item); return ticket_out(item)


@router.post("/tickets/{item_id}/volver", response_model=TicketOut)
def rollback_ticket_flow(
    item_id: str,
    actor: AdminUser = Depends(require_module("tickets")),
    db: Session = Depends(get_db),
) -> TicketOut:
    item = db.get(SupportTicket, item_id)
    if item is None: raise HTTPException(404, "Ticket no encontrado")
    if item.status == "Resuelto": raise HTTPException(409, "No se puede revertir un ticket resuelto")
    restore_ticket_assets(item, db)
    item.asset_ids = []; item.previous_states = {}; item.replacement_asset_ids = []; item.replacement_previous_states = {}
    item.is_repairable = None; item.workflow_type = "Pendiente"; item.status = "Abierto"; item.equipment = "Pendiente de selección"
    audit(db, actor, "Tickets", "Modificó", item.code, "Revirtió el diagnóstico y restauró los estados del inventario.")
    db.commit(); db.refresh(item); return ticket_out(item)


@router.post("/tickets/{item_id}/resolver", response_model=TicketOut)
def resolve_ticket(
    item_id: str,
    payload: TicketResolveIn,
    actor: AdminUser = Depends(require_module("tickets")),
    db: Session = Depends(get_db),
) -> TicketOut:
    item = db.get(SupportTicket, item_id)
    if item is None: raise HTTPException(404, "Ticket no encontrado")
    if item.status == "Resuelto": raise HTTPException(409, "El ticket ya está resuelto")
    if item.workflow_type == "Pendiente": raise HTTPException(409, "Primero selecciona los equipos afectados y guarda los cambios")
    if not payload.evidencias: raise HTTPException(422, "Adjunta al menos una evidencia")
    if item.workflow_type == "Reemplazo":
        affected_ids = item.asset_ids or []; replacement_ids = item.replacement_asset_ids or []
        for affected_id, replacement_id in zip(affected_ids, replacement_ids):
            affected = db.get(InventoryAsset, affected_id); replacement = db.get(InventoryAsset, replacement_id)
            target_state = (item.previous_states or {}).get(affected_id, "Almacén 1")
            if affected is not None: affected.status = "Baja"
            if replacement is not None: replacement.status = target_state
            for order in db.scalars(select(Order).where(Order.operational_status == "Activo")).all():
                states = dict(order.previous_states or {})
                if affected_id in states and replacement is not None:
                    states.pop(affected_id)
                    states[replacement_id] = (item.replacement_previous_states or {}).get(replacement_id, "Almacén 1")
                    order.previous_states = states
                    order.skus = [replacement.sku if sku.upper() == (affected.sku.upper() if affected else "") else sku for sku in (order.skus or [])]
    else:
        restore_ticket_assets(item, db)
    item.evidence_urls = payload.evidencias; item.solution_description = payload.descripcionSolucion
    item.status = "Resuelto"; item.resolved_at = utcnow()
    audit(db, actor, "Tickets", "Modificó", item.code, f"Resolvió el ticket mediante {item.workflow_type}.")
    db.commit(); db.refresh(item); return ticket_out(item)


@router.delete("/tickets/{item_id}", status_code=204)
def delete_ticket(item_id: str, actor: AdminUser = Depends(require_module("tickets")), db: Session = Depends(get_db)) -> None:
    item = db.get(SupportTicket, item_id)
    if item is None:
        raise HTTPException(404, "Ticket no encontrado")
    restore_ticket_assets(item, db)
    audit(db, actor, "Tickets", "Eliminó", item.code, f"Eliminó el ticket {item.code}.")
    db.delete(item)
    db.commit()


def movement_query(module: str | None, desde: date | None, hasta: date | None, search: str | None):
    query = select(AuditLog)
    if module:
        query = query.where(AuditLog.module == module)
    if desde:
        query = query.where(AuditLog.occurred_at >= datetime.combine(desde, datetime.min.time()))
    if hasta:
        query = query.where(AuditLog.occurred_at < datetime.combine(hasta + timedelta(days=1), datetime.min.time()))
    if search:
        term = f"%{search.strip()}%"
        query = query.where(or_(
            AuditLog.username.like(term), AuditLog.action.like(term), AuditLog.element.like(term), AuditLog.detail.like(term)
        ))
    return query


@router.get("/movimientos", response_model=PaginatedAuditOut)
def movements(
    module: str | None = None,
    desde: date | None = None,
    hasta: date | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _: AdminUser = Depends(require_module("movimientos")),
    db: Session = Depends(get_db),
) -> PaginatedAuditOut:
    query = movement_query(module, desde, hasta, search)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(AuditLog.occurred_at.desc()).offset((page - 1) * page_size).limit(page_size)).all()
    return PaginatedAuditOut(items=[audit_out(item) for item in rows], total=total, page=page, pageSize=page_size, pages=max(1, math.ceil(total / page_size)))


def simple_pdf(lines: list[str]) -> bytes:
    escaped = [line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)") for line in lines]
    commands = ["BT", "/F1 9 Tf", "40 800 Td", "12 TL"]
    for line in escaped[:58]:
        commands.extend([f"({line[:110]}) Tj", "T*"])
    commands.append("ET")
    stream = "\n".join(commands).encode("latin-1", "replace")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    output = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, 1):
        offsets.append(len(output)); output.extend(f"{index} 0 obj\n".encode()); output.extend(obj); output.extend(b"\nendobj\n")
    xref = len(output); output.extend(f"xref\n0 {len(objects)+1}\n0000000000 65535 f \n".encode())
    for offset in offsets[1:]: output.extend(f"{offset:010d} 00000 n \n".encode())
    output.extend(f"trailer << /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode())
    return bytes(output)


@router.get("/movimientos/export")
def export_movements(
    format: str = Query("csv", pattern="^(csv|pdf)$"),
    module: str | None = None,
    desde: date | None = None,
    hasta: date | None = None,
    search: str | None = None,
    _: AdminUser = Depends(require_module("movimientos")),
    db: Session = Depends(get_db),
):
    rows = db.scalars(movement_query(module, desde, hasta, search).order_by(AuditLog.occurred_at.desc()).limit(5000)).all()
    if format == "pdf":
        lines = ["AD GLOBAL - Historial de movimientos", ""] + [
            f"{item.occurred_at:%d/%m/%Y %H:%M} | {item.username} | {item.module} | {item.action} | {item.element} | {item.detail}"
            for item in rows
        ]
        return Response(simple_pdf(lines), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=movimientos.pdf"})
    buffer = io.StringIO(); writer = csv.writer(buffer)
    writer.writerow(["Fecha", "Usuario", "Módulo", "Acción", "Elemento", "Detalle", "IP", "Dispositivo"])
    for item in rows:
        writer.writerow([item.occurred_at.isoformat(), item.username, item.module, item.action, item.element, item.detail, item.ip_address, item.device])
    return Response("\ufeff" + buffer.getvalue(), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": "attachment; filename=movimientos.csv"})


@router.post("/movimientos", response_model=AuditOut, status_code=201)
def create_movement(payload: AuditIn, actor: AdminUser = Depends(require_any_module("movimientos", "pedidos", "inventario", "tickets")), db: Session = Depends(get_db)) -> AuditOut:
    item = AuditLog(
        username=actor.username,
        user_id=actor.id,
        module=payload.modulo,
        action=payload.accion,
        element=payload.elemento,
        detail=payload.detalle,
        ip_address=request_ip.get(),
        device=request_device.get(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return audit_out(item)


@router.get("/servicios", response_model=list[ServiceIn])
def admin_services(_: AdminUser=Depends(require_module("gestion-web")), db: Session=Depends(get_db)) -> list[ServiceIn]:
    return [service_out(item) for item in db.scalars(select(Service).order_by(Service.sort_order, Service.title)).all()]


@router.put("/servicios/{service_id}", response_model=ServiceIn)
def upsert_service(service_id: str,payload: ServiceIn,actor: AdminUser=Depends(require_module("gestion-web")),db: Session=Depends(get_db)) -> ServiceIn:
    if service_id != payload.id: raise HTTPException(422,"El id de la ruta y del cuerpo no coincide")
    item=db.get(Service,service_id) or Service(id=service_id); item.title=payload.title; item.category=payload.category; item.description=payload.fullDescription; item.features=payload.features; item.specs=payload.specs; item.ideal_for=payload.idealFor; item.is_active=payload.activo; item.sort_order=payload.orden; db.add(item); audit(db,actor,"Gestión web","Editó",service_id,f"Actualizó el servicio {payload.title}."); db.commit(); return service_out(item)


@router.get("/site-content", response_model=list[SiteContentOut])
def admin_site_content(_: AdminUser=Depends(require_module("gestion-web")), db: Session=Depends(get_db)) -> list[SiteContentOut]:
    return [site_content_out(item) for item in db.scalars(select(SiteContent).order_by(SiteContent.key)).all()]


@router.put("/site-content/{key}", response_model=SiteContentOut)
def update_site_content(key: str, payload: SiteContentUpdate, actor: AdminUser=Depends(require_module("gestion-web")), db: Session=Depends(get_db)) -> SiteContentOut:
    item = db.get(SiteContent, key) or SiteContent(key=key, value=payload.value)
    item.value = payload.value; db.add(item)
    audit(db, actor, "Gestión web", "Editó", key, f"Actualizó el contenido institucional {key}.")
    db.commit(); db.refresh(item); return site_content_out(item)


@router.get("/faqs", response_model=list[FAQOut])
def admin_faqs(_: AdminUser=Depends(require_module("gestion-web")), db: Session=Depends(get_db)) -> list[FAQOut]:
    return [faq_out(item) for item in db.scalars(select(FAQ).order_by(FAQ.sort_order, FAQ.created_at)).all()]


@router.post("/faqs", response_model=FAQOut, status_code=201)
def create_faq(payload: FAQIn, actor: AdminUser=Depends(require_module("gestion-web")), db: Session=Depends(get_db)) -> FAQOut:
    item=FAQ(question=payload.question,answer=payload.answer,sort_order=payload.sortOrder,is_active=payload.isActive); db.add(item)
    audit(db,actor,"Gestión web","Agregó","FAQ",f"Agregó la pregunta {payload.question}."); db.commit(); db.refresh(item); return faq_out(item)


@router.put("/faqs/{item_id}", response_model=FAQOut)
def update_faq(item_id: str,payload: FAQIn,actor: AdminUser=Depends(require_module("gestion-web")),db: Session=Depends(get_db)) -> FAQOut:
    item=db.get(FAQ,item_id)
    if item is None: raise HTTPException(404,"Pregunta no encontrada")
    item.question=payload.question;item.answer=payload.answer;item.sort_order=payload.sortOrder;item.is_active=payload.isActive
    audit(db,actor,"Gestión web","Editó","FAQ",f"Actualizó la pregunta {payload.question}.");db.commit();return faq_out(item)


@router.delete("/faqs/{item_id}",status_code=204)
def delete_faq(item_id: str,actor: AdminUser=Depends(require_module("gestion-web")),db: Session=Depends(get_db)) -> None:
    item=db.get(FAQ,item_id)
    if item is None: raise HTTPException(404,"Pregunta no encontrada")
    audit(db,actor,"Gestión web","Eliminó","FAQ",f"Eliminó la pregunta {item.question}.");db.delete(item);db.commit()


WEB_ASSET_SECTIONS = {"hero", "servicio", "faq"}
ALLOWED_MEDIA_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/ogg": ".ogv",
    "video/x-m4v": ".m4v",
    "video/mpeg": ".mpeg",
}


@router.get("/web-assets", response_model=list[WebAssetOut])
def list_web_assets(_: AdminUser = Depends(require_module("gestion-web")), db: Session = Depends(get_db)) -> list[WebAssetOut]:
    items = db.scalars(
        select(WebAsset).order_by(WebAsset.section, WebAsset.sort_order, WebAsset.created_at)
    ).all()
    return [web_asset_out(item) for item in items]


@router.post("/web-assets", response_model=WebAssetOut, status_code=201)
async def upload_web_asset(
    section: str = Form(...),
    service_id: str | None = Form(None),
    sort_order: int = Form(0),
    file: UploadFile = File(...),
    actor: AdminUser = Depends(require_module("gestion-web")),
    db: Session = Depends(get_db),
) -> WebAssetOut:
    if section not in WEB_ASSET_SECTIONS:
        raise HTTPException(422, "Sección inválida")
    if section == "servicio" and not service_id:
        raise HTTPException(422, "service_id es obligatorio para servicios")
    if sort_order < 0:
        raise HTTPException(422, "El orden no puede ser negativo")

    content_type = file.content_type or ""
    extension = ALLOWED_MEDIA_TYPES.get(content_type)
    if extension is None:
        raise HTTPException(415, "Formato no permitido. Usa imágenes JPG, PNG, WebP, AVIF, GIF o videos MP4, WebM, MOV, OGV o M4V.")

    settings = get_settings()
    is_video = content_type.startswith("video/")
    limit_mb = settings.max_video_upload_mb if is_video else settings.max_upload_mb
    limit_bytes = limit_mb * 1024 * 1024
    directory = Path(settings.upload_directory)
    directory.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{extension}"
    path = directory / filename

    try:
        total = 0
        with path.open("wb") as destination:
            while chunk := await file.read(1024 * 1024):
                total += len(chunk)
                if total > limit_bytes:
                    raise HTTPException(413, f"El archivo supera el límite de {limit_mb} MB")
                destination.write(chunk)
    except HTTPException:
        path.unlink(missing_ok=True)
        raise
    except Exception as exc:
        path.unlink(missing_ok=True)
        raise HTTPException(500, "No se pudo guardar el archivo") from exc
    finally:
        await file.close()

    original_name = Path(file.filename or filename).name
    item = WebAsset(
        section=section,
        service_id=service_id,
        name=original_name,
        file_url=f"{settings.public_upload_url.rstrip('/')}/{filename}",
        mime_type=content_type,
        sort_order=sort_order,
    )
    db.add(item)
    audit(db, actor, "Gestión web", "Agregó", original_name, f"Agregó un archivo multimedia a {section}.")
    db.commit()
    db.refresh(item)
    return web_asset_out(item)


@router.patch("/web-assets/{item_id}", response_model=WebAssetOut)
def update_web_asset(
    item_id: str,
    payload: WebAssetUpdate,
    actor: AdminUser = Depends(require_module("gestion-web")),
    db: Session = Depends(get_db),
) -> WebAssetOut:
    item = db.get(WebAsset, item_id)
    if item is None:
        raise HTTPException(404, "Archivo no encontrado")

    changes = payload.model_dump(exclude_unset=True)
    if "name" in changes:
        item.name = changes["name"]
    if "section" in changes:
        if changes["section"] not in WEB_ASSET_SECTIONS:
            raise HTTPException(422, "Sección inválida")
        item.section = changes["section"]
    if "serviceId" in changes:
        item.service_id = changes["serviceId"]
    if "sortOrder" in changes:
        item.sort_order = changes["sortOrder"]
    if "isActive" in changes:
        item.is_active = changes["isActive"]

    if item.section == "servicio":
        if not item.service_id:
            raise HTTPException(422, "service_id es obligatorio para servicios")
    else:
        item.service_id = None

    audit(db, actor, "Gestión web", "Editó", item.name, f"Actualizó un archivo multimedia de {item.section}.")
    db.commit()
    db.refresh(item)
    return web_asset_out(item)


@router.delete("/web-assets/{item_id}", status_code=204)
def delete_web_asset(item_id: str, actor: AdminUser = Depends(require_module("gestion-web")), db: Session = Depends(get_db)) -> None:
    item = db.get(WebAsset, item_id)
    if item is None:
        raise HTTPException(404, "Archivo no encontrado")
    filename = Path(item.file_url).name
    path = Path(get_settings().upload_directory) / filename
    path.unlink(missing_ok=True)
    audit(db, actor, "Gestión web", "Eliminó", item.name, f"Eliminó un archivo multimedia de {item.section}.")
    db.delete(item)
    db.commit()
