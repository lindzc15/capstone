from fastapi import APIRouter, HTTPException, Depends

from schemas.login_schema import LoginRequest, LoginResponse, VerifyRequest, RegisterRequest, RegisterResponse
from schemas.message_schema import MessageResponse
from services.login_services import LoginServices
from container import Container
from dependency_injector.wiring import Provide, inject


router = APIRouter(prefix="/api/maps", tags=["GoogleMaps"])

#get geolocation from google maps, return to user to store in local storage
#uses dependency injection to grab needed services
#uses Depends so FastApi knows it needs dependency, Provide to point to the location of the service
@router.post("/", response_model=LoginResponse)
@inject
async def login(login: LoginRequest, login_service: LoginServices = Depends(Provide[Container.login_service])):
    try:
        #tries to get jwt token from services, if success return it and success message
        token = login_service.get_login_token(login.username, login.password)
        return LoginResponse(success=True, jwt_token=token)
    except Exception as e:
        #on failure, send back 401 error, proper authentication not acquired
        raise HTTPException(status_code=401, detail=str(e))