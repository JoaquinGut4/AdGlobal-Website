from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from sqlalchemy import text

from backend.app.api import admin, auth, public
from backend.app.core.config import get_settings
from backend.app.core.audit_context import capture_request_context, reset_request_context
from backend.app.core.database import engine


settings = get_settings()


def documentation_urls(environment: str) -> dict[str, str | None]:
    """Expose the interactive API documentation only for explicit local development."""
    if environment == "development":
        return {"openapi_url": "/openapi.json", "docs_url": "/docs", "redoc_url": "/redoc"}
    return {"openapi_url": None, "docs_url": None, "redoc_url": None}


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    Path(settings.upload_directory).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
    **documentation_urls(settings.environment),
)
if settings.force_https:
    app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.mount(settings.public_upload_url, StaticFiles(directory=settings.upload_directory, check_dir=False), name="uploads")
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(public.router, prefix=settings.api_v1_prefix)
app.include_router(admin.router, prefix=settings.api_v1_prefix)

# Certificado de la autoridad local de desarrollo: permite descargarlo desde la tablet
# por HTTP y confiarlo antes de abrir el panel por HTTPS (requisito para usar la cámara).
DEV_CA_CERTIFICATE = Path(__file__).resolve().parents[2] / ".cert" / "adglobal-dev-ca.crt"


if settings.environment == "development":

    @app.get("/dev-ca.crt", include_in_schema=False)
    def development_certificate() -> FileResponse:
        if not DEV_CA_CERTIFICATE.exists():
            raise HTTPException(404, "Certificado de desarrollo no generado")
        return FileResponse(
            DEV_CA_CERTIFICATE,
            media_type="application/x-x509-ca-cert",
            filename="adglobal-dev-ca.crt",
        )


@app.middleware("http")
async def audit_request_context(request, call_next):
    tokens = capture_request_context(request)
    try:
        return await call_next(request)
    finally:
        reset_request_context(tokens)


@app.get("/health", tags=["Sistema"])
def health() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok"}
