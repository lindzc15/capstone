from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    jwt_token: Optional[str]

class VerifyRequest(BaseModel):
    jwt_token: str

class RegisterRequest(BaseModel):
    username: str
    name: str
    email: str
    password: str

class RegisterResponse(BaseModel):
    success: bool
    jwt_token: Optional[str]