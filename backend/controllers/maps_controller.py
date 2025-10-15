from fastapi import APIRouter, HTTPException, Depends

from schemas.login_schema import LoginRequest, LoginResponse, VerifyRequest, RegisterRequest, RegisterResponse
from schemas.message_schema import MessageResponse
from services.login_services import LoginServices
from container import Container
from dependency_injector.wiring import Provide, inject


router = APIRouter(prefix="/api/maps", tags=["GoogleMaps"])

