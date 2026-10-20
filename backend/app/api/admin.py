from datetime import date
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.app.api.dependencies import current_user, require_module, require_super_admin
from backend.app.api.public import quote_out, service_out, web_asset_out
from backend.app.core.config import get_settings
from backend.app.core.database import get_db
from backend.app.core.security import hash_password
from backend.app.models import (
    AdminUser,
    AuditLog,
    Customer,
    InventoryAsset,
    InventoryCategory,
    Order,
    QuoteRequest,
    Service,
    SupportTicket,
    Technician,
    WebAsset,
)
from backend.app.schemas import (
    AdminUserCreate,
    AdminUserOut,
    AdminUserUpdate,
    AuditOut,
    CategoryIn,
    CategoryOut,
    CustomerIn,
    CustomerOut,
    InventoryIn,
    InventoryOut,
    OrderIn,
    OrderOut,
    QuoteOut,
    QuoteUpdate,
    ServiceIn,
    SupportResponsibleOut,
    TechnicianIn,
    TechnicianOut,
    TicketIn,
    TicketOut,
    TicketUpdate,
    WebAssetOut,
    WebAssetUpdate,
)


router = APIRouter(tags=["Panel administrativo"])


def conflict(db: Session, message: str) -> None:
    db.rollback()
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message)


def audit(db: Session, user: AdminUser, module: str, action: str, element: str, detail: str) -> None:
    db.add(AuditLog(username=user.username, user_id=user.id, module=module, action=action, element=element, detail=detail))


def user_out(item: AdminUser) -> AdminUserOut:
    return AdminUserOut(id=item.id, nombre=item.full_name, email=item.email, usuario=item.username, rol=item.role, telefono=item.phone, activo=item.is_active, modulos=item.modules, superAdmin=item.is_super_admin, createdAt=item.created_at)


def category_out(item: InventoryCategory) -> CategoryOut:
    return CategoryOut(id=item.id, label=item.label, codigo=item.code, iconName=item.icon_name, camposPersonalizados=item.custom_fields)


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


def customer_out(item: Customer) -> CustomerOut:
    return CustomerOut(id=item.id, name=item.name, ruc=item.ruc, sector=item.sector, contacto=item.contact_name, email=item.email, telefono=item.phone, eventos=item.event_count, rating=item.rating, ultimaActividad=item.last_activity, estado=item.status)


def order_out(item: Order) -> OrderOut:
    return OrderOut(id=item.id, numeroPedido=item.order_number, fechaEmision=item.issue_date, direccionPartida=item.origin_address, direccionLlegada=item.destination_address, telefonoContacto=item.contact_phone, descripcionProductos=item.product_description, cantidadProductos=item.product_quantity, unidadMedida=item.unit, motivoTraslado=item.transfer_reason, observaciones=item.notes)


def technician_out(item: Technician) -> TechnicianOut:
    return TechnicianOut(id=item.id, nombre=item.name, telefono=item.phone, especialidad=item.specialty, activo=item.is_active)


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
        tecnicoId=item.technician_id,
        tecnico=item.technician_name,
        tecnicoTelefono=item.technician_phone,
        fecha=item.created_at,
    )


@router.get("/dashboard")
def dashboard(_: AdminUser = Depends(require_module("dashboard")), db: Session = Depends(get_db)) -> dict:
    by_status = dict(db.execute(select(InventoryAsset.status, func.count()).group_by(InventoryAsset.status)).all())
    return {
        "inventarioTotal": db.scalar(select(func.count()).select_from(InventoryAsset)) or 0,
        "inventarioPorEstado": by_status,
        "pedidosTotal": db.scalar(select(func.count()).select_from(Order)) or 0,
        "ticketsActivos": db.scalar(select(func.count()).select_from(SupportTicket).where(SupportTicket.status != "Resuelto")) or 0,
        "clientesActivos": db.scalar(select(func.count()).select_from(Customer).where(Customer.status == "Activo")) or 0,
        "cotizacionesNuevas": db.scalar(select(func.count()).select_from(QuoteRequest).where(QuoteRequest.status == "Nueva")) or 0,
    }


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
    if "nombre" in changes: item.full_name = changes["nombre"]
    if "email" in changes: item.email = changes["email"].lower()
    if "usuario" in changes: item.username = changes["usuario"]
    if "password" in changes: item.password_hash = hash_password(changes["password"])
    if "rol" in changes: item.role = changes["rol"]
    if "telefono" in changes: item.phone = changes["telefono"]
    if "activo" in changes: item.is_active = changes["activo"]
    if "modulos" in changes: item.modules = changes["modulos"]
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
def categories(_: AdminUser = Depends(require_module("inventario")), db: Session = Depends(get_db)) -> list[CategoryOut]:
    return [category_out(item) for item in db.scalars(select(InventoryCategory).order_by(InventoryCategory.code)).all()]


@router.post("/inventario/categorias", response_model=CategoryOut, status_code=201)
def create_category(payload: CategoryIn, actor: AdminUser = Depends(require_module("inventario")), db: Session = Depends(get_db)) -> CategoryOut:
    item = InventoryCategory(id=payload.id, label=payload.label, code=payload.codigo, icon_name=payload.iconName, custom_fields=[field.model_dump() for field in payload.camposPersonalizados])
    db.add(item)
    audit(db, actor, "Inventario", "Agregó", payload.id, f"Agregó la categoría {payload.label}.")
    try: db.commit()
    except IntegrityError: conflict(db, "El id, nombre o código de categoría ya existe")
    return category_out(item)


@router.get("/inventario", response_model=list[InventoryOut])
def inventory(category_id: str | None = None, estado: str | None = None, search: str | None = None, _: AdminUser = Depends(require_module("inventario")), db: Session = Depends(get_db)) -> list[InventoryOut]:
    query = select(InventoryAsset).join(InventoryCategory)
    if category_id: query = query.where(InventoryAsset.category_id == category_id)
    if estado: query = query.where(InventoryAsset.status == estado)
    if search:
        term = f"%{search}%"
        query = query.where(InventoryAsset.sku.like(term) | InventoryAsset.serial_number.like(term) | InventoryAsset.description.like(term) | InventoryAsset.brand.like(term))
    return [inventory_out(item) for item in db.scalars(query.order_by(InventoryAsset.sku)).all()]


def apply_inventory(item: InventoryAsset, payload: InventoryIn) -> None:
    item.category_id = payload.categoriaId; item.sku = payload.sku; item.qr = payload.qr; item.photo_url = payload.foto
    item.item = payload.item; item.brand = payload.marca; item.description = payload.descripcion; item.serial_number = payload.numeroSerial
    item.processor = payload.procesador; item.ghz = payload.ghz; item.generation = payload.generacion; item.screen = payload.pantalla
    item.ram = payload.memoriaRam; item.storage = payload.memoriaInterna; item.storage_type = payload.tipoMemoriaInterna; item.model = payload.modelo
    item.purchase_date = payload.fechaCompra; item.purchase_document = payload.facturaGuiaCompra; item.price = payload.precio
    item.supplier = payload.proveedor; item.rentable = payload.alquiler; item.status = payload.estado; item.notes = payload.observaciones
    item.custom_specs = payload.especificacionesPersonalizadas


@router.post("/inventario", response_model=InventoryOut, status_code=201)
def create_inventory(payload: InventoryIn, actor: AdminUser = Depends(require_module("inventario")), db: Session = Depends(get_db)) -> InventoryOut:
    if db.get(InventoryCategory, payload.categoriaId) is None: raise HTTPException(422, "Categoría inexistente")
    item = InventoryAsset(); apply_inventory(item, payload); db.add(item)
    audit(db, actor, "Inventario", "Agregó", payload.sku, f"Agregó el producto {payload.sku} · {payload.descripcion}.")
    try: db.commit()
    except IntegrityError: conflict(db, "El SKU, QR o número serial ya está registrado")
    db.refresh(item); return inventory_out(item)


@router.put("/inventario/{item_id}", response_model=InventoryOut)
def update_inventory(item_id: str, payload: InventoryIn, actor: AdminUser = Depends(require_module("inventario")), db: Session = Depends(get_db)) -> InventoryOut:
    item = db.get(InventoryAsset, item_id)
    if item is None: raise HTTPException(404, "Activo no encontrado")
    apply_inventory(item, payload); audit(db, actor, "Inventario", "Modificó", payload.sku, f"Modificó el producto {payload.sku}.")
    try: db.commit()
    except IntegrityError: conflict(db, "El SKU, QR o número serial ya está registrado")
    db.refresh(item); return inventory_out(item)


@router.delete("/inventario/{item_id}", status_code=204)
def delete_inventory(item_id: str, actor: AdminUser = Depends(require_module("inventario")), db: Session = Depends(get_db)) -> None:
    item = db.get(InventoryAsset, item_id)
    if item is None: raise HTTPException(404, "Activo no encontrado")
    audit(db, actor, "Inventario", "Eliminó", item.sku, f"Eliminó el producto {item.sku}."); db.delete(item); db.commit()


@router.get("/clientes", response_model=list[CustomerOut])
def customers(_: AdminUser = Depends(require_module("clientes")), db: Session = Depends(get_db)) -> list[CustomerOut]:
    return [customer_out(item) for item in db.scalars(select(Customer).order_by(Customer.name)).all()]


@router.post("/clientes", response_model=CustomerOut, status_code=201)
def create_customer(payload: CustomerIn, actor: AdminUser = Depends(require_module("clientes")), db: Session = Depends(get_db)) -> CustomerOut:
    item = Customer(name=payload.name, ruc=payload.ruc, sector=payload.sector, contact_name=payload.contacto, email=payload.email, phone=payload.telefono, event_count=payload.eventos, rating=payload.rating, last_activity=payload.ultimaActividad, status=payload.estado)
    db.add(item); audit(db, actor, "Clientes", "Creó", payload.ruc, f"Creó el cliente {payload.name}.")
    try: db.commit()
    except IntegrityError: conflict(db, "El RUC ya está registrado")
    db.refresh(item); return customer_out(item)


@router.put("/clientes/{item_id}", response_model=CustomerOut)
def update_customer(item_id: str, payload: CustomerIn, actor: AdminUser = Depends(require_module("clientes")), db: Session = Depends(get_db)) -> CustomerOut:
    item = db.get(Customer, item_id)
    if item is None: raise HTTPException(404, "Cliente no encontrado")
    item.name=payload.name; item.ruc=payload.ruc; item.sector=payload.sector; item.contact_name=payload.contacto; item.email=payload.email; item.phone=payload.telefono; item.event_count=payload.eventos; item.rating=payload.rating; item.last_activity=payload.ultimaActividad; item.status=payload.estado
    audit(db, actor, "Clientes", "Editó", item.ruc, f"Editó el cliente {item.name}."); db.commit(); return customer_out(item)


@router.get("/pedidos", response_model=list[OrderOut])
def orders(_: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> list[OrderOut]:
    return [order_out(item) for item in db.scalars(select(Order).order_by(Order.issue_date.desc(), Order.order_number.desc())).all()]


def next_order_number(db: Session) -> str:
    year = date.today().year
    prefix = f"PED-{year}-"
    latest = db.scalar(select(Order.order_number).where(Order.order_number.like(f"{prefix}%")).order_by(Order.order_number.desc()).limit(1))
    sequence = int(latest.rsplit("-", 1)[-1]) + 1 if latest else 1
    return f"{prefix}{sequence:03d}"


def apply_order(item: Order, payload: OrderIn) -> None:
    item.issue_date=payload.fechaEmision; item.origin_address=payload.direccionPartida; item.destination_address=payload.direccionLlegada; item.contact_phone=payload.telefonoContacto; item.product_description=payload.descripcionProductos; item.product_quantity=payload.cantidadProductos; item.unit=payload.unidadMedida; item.transfer_reason=payload.motivoTraslado; item.notes=payload.observaciones


@router.post("/pedidos", response_model=OrderOut, status_code=201)
def create_order(payload: OrderIn, actor: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> OrderOut:
    item=Order(order_number=next_order_number(db)); apply_order(item,payload); db.add(item); audit(db,actor,"Pedidos","Creó",item.order_number,f"Creó el pedido {item.order_number}.")
    try: db.commit()
    except IntegrityError: conflict(db,"No se pudo asignar el correlativo; vuelva a intentarlo")
    db.refresh(item); return order_out(item)


@router.put("/pedidos/{item_id}", response_model=OrderOut)
def update_order(item_id: str, payload: OrderIn, actor: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> OrderOut:
    item=db.get(Order,item_id)
    if item is None: raise HTTPException(404,"Pedido no encontrado")
    apply_order(item,payload); audit(db,actor,"Pedidos","Editó",item.order_number,f"Editó el pedido {item.order_number}."); db.commit(); return order_out(item)


@router.delete("/pedidos/{item_id}", status_code=204)
def delete_order(item_id: str, actor: AdminUser = Depends(require_module("pedidos")), db: Session = Depends(get_db)) -> None:
    item=db.get(Order,item_id)
    if item is None: raise HTTPException(404,"Pedido no encontrado")
    audit(db,actor,"Pedidos","Eliminó",item.order_number,f"Eliminó el pedido {item.order_number}."); db.delete(item); db.commit()


@router.get("/usuarios/soporte", response_model=list[SupportResponsibleOut])
def support_responsibles(
    user: AdminUser = Depends(current_user),
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


@router.get("/tecnicos", response_model=list[TechnicianOut])
def technicians(_: AdminUser = Depends(current_user), db: Session = Depends(get_db)) -> list[TechnicianOut]:
    return [technician_out(item) for item in db.scalars(select(Technician).where(Technician.is_active.is_(True)).order_by(Technician.name)).all()]


@router.post("/tecnicos", response_model=TechnicianOut, status_code=201)
def create_technician(payload: TechnicianIn, _: AdminUser = Depends(require_module("configuracion")), db: Session = Depends(get_db)) -> TechnicianOut:
    item=Technician(name=payload.nombre,phone=payload.telefono,specialty=payload.especialidad,is_active=payload.activo); db.add(item); db.commit(); db.refresh(item); return technician_out(item)


@router.get("/tickets", response_model=list[TicketOut])
def tickets(_: AdminUser = Depends(require_module("tickets")), db: Session = Depends(get_db)) -> list[TicketOut]:
    return [ticket_out(item) for item in db.scalars(select(SupportTicket).order_by(SupportTicket.created_at.desc())).all()]


def next_ticket_code(db: Session) -> str:
    year=date.today().year; prefix=f"TKT-{year}-"; latest=db.scalar(select(SupportTicket.code).where(SupportTicket.code.like(f"{prefix}%")).order_by(SupportTicket.code.desc()).limit(1)); seq=int(latest.rsplit("-",1)[-1])+1 if latest else 1; return f"{prefix}{seq:03d}"


@router.post("/tickets", response_model=TicketOut, status_code=201)
def create_ticket(payload: TicketIn, actor: AdminUser = Depends(require_module("tickets")), db: Session = Depends(get_db)) -> TicketOut:
    support_user: AdminUser | None = None
    technician: Technician | None = None

    if payload.tecnicoId:
        support_id = payload.tecnicoId.removeprefix("soporte:")
        support_user = db.get(AdminUser, support_id)
        if support_user and (support_user.role != "Soporte" or not support_user.is_active):
            support_user = None
        if support_user is None:
            technician = db.get(Technician, payload.tecnicoId)

    technician_name = (
        support_user.full_name
        if support_user
        else technician.name
        if technician
        else payload.tecnico
    )
    technician_phone = (
        support_user.phone
        if support_user
        else technician.phone
        if technician
        else payload.tecnicoTelefono
    )

    item = SupportTicket(
        code=next_ticket_code(db),
        area=payload.area,
        equipment=payload.equipo,
        customer=payload.cliente,
        priority=payload.prioridad,
        description=payload.descripcion,
        order_or_status=payload.numeroPedidoEstado,
        ticket_type=payload.tipoTicket or "",
        order_number=payload.numeroPedido,
        contact_phone=payload.telefonoContacto,
        order_address=payload.direccionPedido,
        equipment_status=payload.estadoEquipo,
        technician_id=technician.id if technician else None,
        technician_name=technician_name,
        technician_phone=technician_phone,
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
    for source,target in (("area","area"),("prioridad","priority"),("estado","status"),("descripcion","description")):
        if source in changes: setattr(item,target,changes[source])
    if "tecnicoId" in changes:
        tech=db.get(Technician,changes["tecnicoId"]) if changes["tecnicoId"] else None; item.technician_id=tech.id if tech else None; item.technician_name=tech.name if tech else ""; item.technician_phone=tech.phone if tech else ""
    audit(db,actor,"Tickets","Editó",item.code,f"Actualizó el ticket {item.code}."); db.commit(); return ticket_out(item)


@router.delete("/tickets/{item_id}", status_code=204)
def delete_ticket(item_id: str, actor: AdminUser = Depends(require_module("tickets")), db: Session = Depends(get_db)) -> None:
    item = db.get(SupportTicket, item_id)
    if item is None:
        raise HTTPException(404, "Ticket no encontrado")
    audit(db, actor, "Tickets", "Eliminó", item.code, f"Eliminó el ticket {item.code}.")
    db.delete(item)
    db.commit()


@router.get("/movimientos", response_model=list[AuditOut])
def movements(module: str | None=None, limit: int=Query(100,ge=1,le=500), _: AdminUser=Depends(require_module("movimientos")), db: Session=Depends(get_db)) -> list[AuditOut]:
    query=select(AuditLog)
    if module: query=query.where(AuditLog.module==module)
    rows=db.scalars(query.order_by(AuditLog.occurred_at.desc()).limit(limit)).all()
    return [AuditOut(id=x.id,fecha=x.occurred_at,usuario=x.username,modulo=x.module,accion=x.action,elemento=x.element,detalle=x.detail) for x in rows]


@router.get("/cotizaciones", response_model=list[QuoteOut])
def quotes(_: AdminUser=Depends(require_module("clientes")), db: Session=Depends(get_db)) -> list[QuoteOut]:
    return [quote_out(x) for x in db.scalars(select(QuoteRequest).order_by(QuoteRequest.created_at.desc())).all()]


@router.patch("/cotizaciones/{item_id}", response_model=QuoteOut)
def update_quote(item_id: str,payload: QuoteUpdate,actor: AdminUser=Depends(require_module("clientes")),db: Session=Depends(get_db)) -> QuoteOut:
    item=db.get(QuoteRequest,item_id)
    if item is None: raise HTTPException(404,"Cotización no encontrada")
    item.status=payload.estado; audit(db,actor,"Clientes","Editó",item.id,f"Cambió la cotización a {item.status}."); db.commit(); return quote_out(item)


@router.put("/servicios/{service_id}", response_model=ServiceIn)
def upsert_service(service_id: str,payload: ServiceIn,actor: AdminUser=Depends(require_module("gestion-web")),db: Session=Depends(get_db)) -> ServiceIn:
    if service_id != payload.id: raise HTTPException(422,"El id de la ruta y del cuerpo no coincide")
    item=db.get(Service,service_id) or Service(id=service_id); item.title=payload.title; item.category=payload.category; item.description=payload.fullDescription; item.features=payload.features; item.specs=payload.specs; item.ideal_for=payload.idealFor; item.is_active=payload.activo; item.sort_order=payload.orden; db.add(item); audit(db,actor,"Gestión web","Editó",service_id,f"Actualizó el servicio {payload.title}."); db.commit(); return service_out(item)


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
