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
    message: Optional[str]

class AddRestaurantRequest(BaseModel):
    folder_id: int
    restaurant_id: str
    rest_name: str
    loc: str
    price_range: str
    avg_rating: float
    main_photo_url: str

class FolderContentsRequest(BaseModel):
    folder_id: int

class RestaurantInfoSchema(BaseModel):
    restaurant_id: str
    rest_name: str
    loc: str
    price_range: str
    avg_rating: float
    main_photo_url: str

class FolderContentsResponse(BaseModel):
    success: bool
    contents: List[RestaurantInfoSchema]

class AddNotesRequest(BaseModel):
    jwt_token: str
    restaurant_id: str
    user_rating: float
    date_visited: str
    favorite_dish: str
    notes: str

class NotesInfoSchema(BaseModel):
    user_rating: Optional[float]
    date_visited: Optional[str]
    favorite_dish: Optional[str]
    notes: Optional[str]

class NotesResponse(BaseModel):
    success: bool
    message: str
    user_notes: Optional[NotesInfoSchema]
    
class NotesRequest(BaseModel):
    jwt_token: str
    restaurant_id: str