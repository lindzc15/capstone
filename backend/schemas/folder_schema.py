from pydantic import BaseModel
from typing import Optional, List

#creates schemas that can easily be converted to/from json
#Base model will validate against defined types
class FolderRequest(BaseModel):
    jwt_token: str

class FolderInfo(BaseModel):
    folder_id: int
    folder_name: str
    color: Optional[str] = None
    user_id: int

    class Config:
        orm_mode = True

class FolderResponse(BaseModel):
    success: bool
    folders_info: List[FolderInfo]