from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models import FAQ, Service, SiteContent, WebAsset, as_utc
from backend.app.schemas import FAQOut, ServiceIn, SiteContentOut, WebAssetOut


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
        createdAt=as_utc(item.created_at),
    )


def site_content_out(item: SiteContent) -> SiteContentOut:
    return SiteContentOut(key=item.key, value=item.value)


def faq_out(item: FAQ) -> FAQOut:
    return FAQOut(id=item.id, question=item.question, answer=item.answer, sortOrder=item.sort_order, isActive=item.is_active)


@router.get("/services", response_model=list[ServiceIn])
def services(db: Session = Depends(get_db)) -> list[ServiceIn]:
    items = db.scalars(
        select(Service).where(Service.is_active.is_(True)).order_by(Service.sort_order, Service.title)
    ).all()
    return [service_out(item) for item in items]


@router.get("/content", response_model=list[SiteContentOut])
def content(db: Session = Depends(get_db)) -> list[SiteContentOut]:
    return [site_content_out(item) for item in db.scalars(select(SiteContent).order_by(SiteContent.key)).all()]


@router.get("/faqs", response_model=list[FAQOut])
def faqs(db: Session = Depends(get_db)) -> list[FAQOut]:
    return [faq_out(item) for item in db.scalars(select(FAQ).where(FAQ.is_active.is_(True)).order_by(FAQ.sort_order, FAQ.created_at)).all()]


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
