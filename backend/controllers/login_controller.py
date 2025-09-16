from fastapi import APIRouter, HTTPException

from schemas.login_schema import LoginRequest, LoginResponse, VerifyRequest, RegisterRequest, RegisterResponse
from schemas.message_schema import MessageResponse
from services.login_services import LoginServices


router = APIRouter(prefix="/api/login", tags=["Authentication"])

#to test that login endpoint is working
@router.get("/", response_model=MessageResponse)
def check_login_endpoint():
    return {"message": "login endpoint found!"}

#returning user logging in
@router.post("/", response_model=LoginResponse)
async def login(login: LoginRequest):
    try:
        #tries to get jwt token from services, if success return it and success message
        token = LoginServices.get_login_token(login.username, login.password)
        return LoginResponse(success=True, jwt_token=token)
    except Exception as e:
        #on failure, send back 401 error, proper authentication not acquired
        raise HTTPException(status_code=401, detail=str(e))
    
#verifies that jwt token still valid
@router.post("/verify", response_model=LoginResponse)
async def login(verify_request: VerifyRequest):
    try:
        verified = LoginServices.verify_token(verify_request.jwt_token)
        return LoginResponse(success=True, jwt_token=verify_request.jwt_token)
    except Exception as e:
        #on failure, send back 401 error, proper authentication not acquired
        raise HTTPException(status_code=401, detail=str(e))
    
#new user registration
@router.post("/register", response_model=RegisterResponse)
async def register(register_req: RegisterRequest):
    try:
        token = LoginServices.register(register_req.username, register_req.name, register_req.email, register_req.password)
        return RegisterResponse(success=True, jwt_token=token)
    except Exception as e:
        #on failure, send back 500 error, unable to fullfill the request
        raise HTTPException(status_code=500, detail=str(e))