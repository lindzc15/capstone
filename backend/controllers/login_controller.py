from fastapi import APIRouter, HTTPException

from schemas.login_schema import LoginRequest, LoginResponse
from services.login_services import LoginService


router = APIRouter(prefix="/api/login", tags=["Authentication"])

#user trying to login, sends post to login endpoint
@router.post("/", response_model=LoginResponse)
async def login(login: LoginRequest):
    try:
        #tries to get jwt token from services, if success return it and success message
        token = LoginService.get_login_token(login.username, login.password)
        return LoginResponse(success=True, jwt_token=token)
    except Exception as e:
        #On failure, send back 401 error, proper authentication not acquired
        raise HTTPException(status_code=401, detail=str(e))