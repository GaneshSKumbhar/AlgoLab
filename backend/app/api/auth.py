"""Account registration and sign-in endpoints."""
from fastapi import APIRouter, Depends
from app.auth.service import current_user, login, register
from app.models.schemas import AuthRequest, AuthResponse

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=AuthResponse, status_code=201)
def create_account(request: AuthRequest):
    return register(request.username, request.password)


@router.post("/login", response_model=AuthResponse)
def sign_in(request: AuthRequest):
    return login(request.username, request.password)


@router.get("/me")
def who_am_i(username: str = Depends(current_user)):
    return {"username": username}
