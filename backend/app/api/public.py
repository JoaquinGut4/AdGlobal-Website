from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models import QuoteRequest, Service, WebAsset
from backend.app.schemas import QuoteIn, QuoteOut, ServiceIn, WebAssetOut


router = APIRouter(prefix="/public", tags=["Web pública"])


def service_out(item: Service) -> ServiceIn:
    return ServiceIn(
        id=item.id,
        title=item.title,
        category=item.category,
        fullDescription=item.description,
        features=item.features,
        specs=item.specs,
        idealFor=item.ideal_for,
        activo=item.is_active,
        orden=item.sort_order,
    )


def web_asset_out(item: WebAsset) -> WebAssetOut:
    return WebAssetOut(
        id=item.id,
        section=item.section,
        serviceId=item.service_id,
        name=item.name,
        dataUrl=item.file_url,
        mimeType=item.mime_type,
        sortOrder=item.sort_order,
        isActive=item.is_active,
        createdAt=item.created_at,
    )


def quote_out(item: QuoteRequest) -> QuoteOut:
    return QuoteOut(
        id=item.id,
        nombre=item.full_name,
        empresa=item.company,
        correo=item.email,
        telefono=item.phone,
        servicioId=item.service_id,
        fechas=item.requested_dates,
        ciudad=item.city,
        mensaje=item.message,
        estado=item.status,
        createdAt=item.created_at,
    )


@router.get("/services", response_model=list[ServiceIn])
def services(db: Session = Depends(get_db)) -> list[ServiceIn]:
    items = db.scalars(
        select(Service).where(Service.is_active.is_(True)).order_by(Service.sort_order, Service.title)
    ).all()
    return [service_out(item) for item in items]


@router.get("/web-assets", response_model=list[WebAssetOut])
def web_assets(
    section: str | None = None,
    service_id: str | None = None,
    db: Session = Depends(get_db),
) -> list[WebAssetOut]:
    query = select(WebAsset).where(WebAsset.is_active.is_(True))
    if section:
        query = query.where(WebAsset.section == section)
    if service_id:
        query = query.where(WebAsset.service_id == service_id)
    items = db.scalars(query.order_by(WebAsset.sort_order, WebAsset.created_at)).all()
    return [web_asset_out(item) for item in items]


@router.post("/quotes", response_model=QuoteOut, status_code=status.HTTP_201_CREATED)
def create_quote(payload: QuoteIn, db: Session = Depends(get_db)) -> QuoteOut:
    if db.get(Service, payload.servicioId) is None:
        raise HTTPException(status_code=422, detail="El servicio indicado no existe")
    item = QuoteRequest(
        full_name=payload.nombre,
        company=payload.empresa,
        email=payload.correo.lower(),
        phone=payload.telefono,
        service_id=payload.servicioId,
        requested_dates=payload.fechas,
        city=payload.ciudad,
        message=payload.mensaje,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return quote_out(item)
