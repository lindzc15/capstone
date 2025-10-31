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


class FolderResponse(BaseModel):
    success: bool
    folders_info: List[FolderInfo]


class AddFolderRequest(BaseModel):
    folder_name: str
    color: Optional[str] = None
    jwt_token: str

class AddResponse(BaseModel):
    success: bool

class AddRestaurantRequest(BaseModel):
    folder_id: str
    restaurant_id: str
    rest_name: str
    loc: str
    price_range: str
    avg_rating: float
    main_photo_url: str