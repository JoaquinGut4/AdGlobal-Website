"""Importa los medios de web_publica al módulo Gestión web.

Copia las fotos y videos de ``frontend/web_publica/src/assets/servicios`` a la
carpeta de uploads del backend y crea los registros de ``web_assets`` para que
aparezcan en el panel y los consuma la web pública.

Uso:
    python -m backend.scripts.import_web_media
    python -m backend.scripts.import_web_media --dry-run

El script es idempotente: si un archivo ya está registrado en la base de datos,
se omite. Los archivos originales de web_publica no se eliminan.
"""

from __future__ import annotations

import argparse
import hashlib
import logging
import re
import shutil
import unicodedata
from pathlib import Path

from sqlalchemy import select

from backend.app.core.config import get_settings
from backend.app.core.database import SessionLocal
from backend.app.models import WebAsset

logger = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "frontend" / "web_publica" / "src" / "assets" / "servicios"

SERVICE_FOLDERS: dict[str, tuple[str, ...]] = {
    "laptops-computadores": ("laptops", "computadoras"),
    "tablets": ("tablets",),
    "impresoras-multifuncionales": ("impresoras",),
    "proyectores": ("proyectores",),
    "equipos-audiovisuales": ("audiovisuales",),
    "totems-digitales": ("Totems",),
    "pantallas-led": ("pantallas-led", "televisores"),
    "desarrollo-web": ("desarrollo-web",),
}

SERVICE_TITLES: dict[str, str] = {
    "laptops-computadores": "Laptops y computadoras",
    "tablets": "Tablets",
    "impresoras-multifuncionales": "Impresoras multifuncionales",
    "proyectores": "Proyectores",
    "equipos-audiovisuales": "Equipos audiovisuales",
    "totems-digitales": "Tótems digitales",
    "pantallas-led": "Pantallas LED y televisores",
    "desarrollo-web": "Desarrollo web y soluciones digitales",
}

HERO_ORDER = (
    "pantallas-led",
    "equipos-audiovisuales",
    "laptops-computadores",
    "proyectores",
    "totems-digitales",
    "tablets",
    "impresoras-multifuncionales",
    "desarrollo-web",
)

FAQ_FILES: tuple[tuple[str, str, str], ...] = (
    ("pantallas-led", "PantallasLED 1.jpeg", "Pantallas LED"),
    ("audiovisuales", "Audiovisual 1.jpg", "Equipos audiovisuales"),
    ("Totems", "Totems 3.jpeg", "Tótems digitales"),
    ("laptops", "Laptops 1.webp", "Laptops y computadoras"),
    ("tablets", "Tablets 1.jpg", "Tablets"),
)

MIME_BY_EXTENSION = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".ogv": "video/ogg",
    ".m4v": "video/x-m4v",
    ".mpeg": "video/mpeg",
}


def natural_key(path: Path) -> list[object]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", path.name)]


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-zA-Z0-9]+", "-", normalized).strip("-").lower() or "archivo"


def relative_source(source: Path) -> str:
    return source.relative_to(SOURCE).as_posix()


def service_files(service_id: str) -> list[Path]:
    files: list[Path] = []
    for folder in SERVICE_FOLDERS.get(service_id, ()):
        folder_path = SOURCE / folder
        if not folder_path.is_dir():
            logger.warning("No existe la carpeta %s", folder_path)
            continue
        for path in sorted(folder_path.iterdir(), key=natural_key):
            if path.is_file() and path.suffix.lower() in MIME_BY_EXTENSION:
                files.append(path)
    return files


def target_filename(section: str, service_id: str | None, source: Path) -> str:
    digest = hashlib.sha1(relative_source(source).encode("utf-8")).hexdigest()[:8]
    owner = slugify(service_id or "web")
    return f"{section}-{owner}-{slugify(source.stem)}-{digest}{source.suffix.lower()}"


def ensure_asset(
    db,
    *,
    section: str,
    service_id: str | None,
    name: str,
    source: Path,
    sort_order: int,
    upload_dir: Path,
    public_url: str,
    dry_run: bool,
) -> str:
    filename = target_filename(section, service_id, source)
    file_url = f"{public_url.rstrip('/')}/{filename}"
    if db.scalar(select(WebAsset).where(WebAsset.file_url == file_url)) is not None:
        return "skipped"

    if not dry_run:
        upload_dir.mkdir(parents=True, exist_ok=True)
        target = upload_dir / filename
        if not target.exists():
            shutil.copy2(source, target)
        db.add(
            WebAsset(
                section=section,
                service_id=service_id,
                name=name,
                file_url=file_url,
                mime_type=MIME_BY_EXTENSION[source.suffix.lower()],
                sort_order=sort_order,
                is_active=True,
            )
        )
    return "created"


def import_media(*, dry_run: bool = False) -> tuple[int, int]:
    settings = get_settings()
    upload_dir = Path(settings.upload_directory)
    if not upload_dir.is_absolute():
        upload_dir = ROOT / upload_dir

    created = 0
    skipped = 0
    with SessionLocal() as db:
        for service_id in SERVICE_FOLDERS:
            files = service_files(service_id)
            for order, source in enumerate(files):
                result = ensure_asset(
                    db,
                    section="servicio",
                    service_id=service_id,
                    name=source.stem,
                    source=source,
                    sort_order=order,
                    upload_dir=upload_dir,
                    public_url=settings.public_upload_url,
                    dry_run=dry_run,
                )
                created += result == "created"
                skipped += result == "skipped"

        for order, service_id in enumerate(HERO_ORDER):
            files = service_files(service_id)
            first_image = next(
                (path for path in files if MIME_BY_EXTENSION[path.suffix.lower()].startswith("image/")),
                None,
            )
            if first_image is None:
                logger.warning("Sin imagen de portada para el hero: %s", service_id)
                continue
            result = ensure_asset(
                db,
                section="hero",
                service_id=service_id,
                name=SERVICE_TITLES[service_id],
                source=first_image,
                sort_order=order,
                upload_dir=upload_dir,
                public_url=settings.public_upload_url,
                dry_run=dry_run,
            )
            created += result == "created"
            skipped += result == "skipped"

        for order, (folder, filename, label) in enumerate(FAQ_FILES):
            source = SOURCE / folder / filename
            if not source.is_file():
                logger.warning("No se encontró el archivo de FAQ %s", source)
                continue
            result = ensure_asset(
                db,
                section="faq",
                service_id=None,
                name=f"Preguntas frecuentes · {label}",
                source=source,
                sort_order=order,
                upload_dir=upload_dir,
                public_url=settings.public_upload_url,
                dry_run=dry_run,
            )
            created += result == "created"
            skipped += result == "skipped"

        if not dry_run:
            db.commit()

    return created, skipped


def main() -> None:
    parser = argparse.ArgumentParser(description="Importa las fotos de web_publica a Gestión web.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Muestra lo que se importaría sin copiar archivos ni escribir en la base de datos.",
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    created, skipped = import_media(dry_run=args.dry_run)
    prefix = "Simulación" if args.dry_run else "Importación"
    logger.info("%s completada: %d archivos nuevos, %d ya existentes.", prefix, created, skipped)


if __name__ == "__main__":
    main()
