from pydantic import BaseModel
from typing import Optional

#creates schemas that can easily be converted to/from json
#Base model will validate against defined types
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
    full_name: str
    email: str
    password: str

class RegisterResponse(BaseModel):
    success: bool
    jwt_token: Optional[str]
    message: Optional[str]

