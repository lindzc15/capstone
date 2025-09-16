from pydantic import BaseModel

#for simple message responses for checking api status
class MessageResponse(BaseModel):
    message: str