"""Aplicación HTTPS local para probar el panel y la cámara desde una tablet."""

from pathlib import Path

from fastapi.staticfiles import StaticFiles

from backend.app.main import app


ADMIN_DIST = Path(__file__).resolve().parents[2] / "frontend" / "panel_admin" / "dist"

if not (ADMIN_DIST / "index.html").exists():
    raise RuntimeError("Falta el build del panel administrativo. Ejecuta `npm run build`.")

# Se monta al final para que /api, /uploads, /docs y /health conserven prioridad.
app.mount("/", StaticFiles(directory=ADMIN_DIST, html=True), name="tablet-admin")
