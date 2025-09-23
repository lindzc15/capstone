from fastapi import APIRouter, HTTPException, Depends

from schemas.login_schema import LoginRequest, LoginResponse, VerifyRequest, RegisterRequest, RegisterResponse
from schemas.message_schema import MessageResponse
from services.login_services import LoginServices
from container import Container
from dependency_injector.wiring import Provide, inject


router = APIRouter(prefix="/api/login", tags=["Authentication"])

#to test that login endpoint is working
@router.get("/", response_model=MessageResponse)
def check_login_endpoint():
    return {"message": "login endpoint found!"}

#returning user logging in
#uses dependency injection to grab needed services
#uses Depends so FastApi know it needs dependency, Provide to point to the location of the service
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
    

#verifies that jwt token still valid
@router.post("/verify", response_model=LoginResponse)
@inject
async def login(verify_request: VerifyRequest, login_service: LoginServices = Depends(Provide[Container.login_service])):
    try:
        verified = login_service.verify_token(verify_request.jwt_token)
        return LoginResponse(success=True, jwt_token=verify_request.jwt_token)
    except Exception as e:
        #on failure, send back 401 error, proper authentication not acquired
        raise HTTPException(status_code=401, detail=str(e))
    

#new user registration
@router.post("/register", response_model=RegisterResponse)
@inject
async def register(register_req: RegisterRequest, login_service: LoginServices = Depends(Provide[Container.login_service])):
    try:
        success, token, msg = login_service.register(register_req.username, register_req.full_name, register_req.email, register_req.password)
        return RegisterResponse(success=success, jwt_token=token, message = msg)
    except Exception as e:
        #on failure, send back 500 error, unable to fullfill the request
        raise HTTPException(status_code=500, detail=str(e))