from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from backend.app.api.dependencies import current_user
from backend.app.core.config import get_settings
from backend.app.core.database import get_db
from backend.app.core.security import create_token, decode_token, verify_password
from backend.app.models import AdminUser, utcnow
from backend.app.schemas import LoginRequest, RefreshRequest, SessionUser, TokenResponse


router = APIRouter(prefix="/auth", tags=["Autenticación"])


def session_user(user: AdminUser) -> SessionUser:
    return SessionUser(
        id=user.id,
        email=user.email,
        usuario=user.username,
        nombre=user.full_name,
        rol=user.role,
        telefono=user.phone,
        modulos=user.modules,
        superAdmin=user.is_super_admin,
    )


def token_response(user: AdminUser) -> TokenResponse:
    settings = get_settings()
    return TokenResponse(
        accessToken=create_token(user.id, "access"),
        refreshToken=create_token(user.id, "refresh"),
        expiresIn=settings.access_token_minutes * 60,
        user=session_user(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = payload.email.lower()
    username = payload.usuario.lower()
    user = db.scalar(
        select(AdminUser).where(
            func.lower(AdminUser.email) == email,
            func.lower(AdminUser.username) == username,
        )
    )
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Esta cuenta está desactivada")
    user.last_login_at = utcnow()
    db.commit()
    return token_response(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user_id = decode_token(payload.refreshToken, "refresh")
    user = db.get(AdminUser, user_id) if user_id else None
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido")
    return token_response(user)


@router.get("/me", response_model=SessionUser)
def me(user: AdminUser = Depends(current_user)) -> SessionUser:
    return session_user(user)
