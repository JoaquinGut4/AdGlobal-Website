from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import decode_token
from backend.app.models import AdminUser


bearer = HTTPBearer(auto_error=False)


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> AdminUser:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Autenticación requerida")
    claims = decode_token(credentials.credentials, "access")
    user = db.get(AdminUser, claims[0]) if claims else None
    if user is None or not user.is_active or claims[1] != user.token_version:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida o vencida")
    return user


def require_module(module: str) -> Callable:
    def dependency(user: AdminUser = Depends(current_user)) -> AdminUser:
        if not user.is_super_admin and module not in user.modules:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Módulo no autorizado")
        return user

    return dependency


def require_any_module(*modules: str) -> Callable:
    allowed = set(modules)

    def dependency(user: AdminUser = Depends(current_user)) -> AdminUser:
        if not user.is_super_admin and not allowed.intersection(user.modules):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Módulo no autorizado")
        return user

    return dependency


def require_super_admin(user: AdminUser = Depends(current_user)) -> AdminUser:
    if not user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Se requiere superadministrador")
    return user
