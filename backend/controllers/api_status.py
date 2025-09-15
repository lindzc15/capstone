from fastapi import APIRouter, HTTPException
from schemas.message_schema import MessageResponse

router = APIRouter(prefix="", tags=["Status"])


#hello world to api
@router.get("/", response_model=MessageResponse)
def hello():
    return {"message": "Hello from FastAPI!"}

#simple check that api is working
@router.get("/health", response_model=MessageResponse)
def check_health():
    return {"message": "OK"}