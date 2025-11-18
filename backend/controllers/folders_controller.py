from fastapi import APIRouter, HTTPException, Depends


from schemas.folder_schema import FolderInfo, FolderRequest,  FolderResponse, AddFolderRequest, AddResponse, AddRestaurantRequest, FolderContentsRequest, FolderContentsResponse, RestaurantInfoSchema, AddNotesRequest, NotesResponse, NotesRequest, NotesInfoSchema
from schemas.message_schema import MessageResponse
from services.login_services import LoginServices
from services.folder_services import FolderServices
from container import Container
from dependency_injector.wiring import Provide, inject


router = APIRouter(prefix="/api/folders", tags=["Folders"])

#to test that folders endpoint is working
@router.get("/", response_model=MessageResponse)
def check_login_endpoint():
    return {"message": "folders endpoint found!"}

#gets all folder info for a user
@router.post("/", response_model=FolderResponse)
@inject
async def getUserFolders(jwt: FolderRequest, folder_service: FolderServices = Depends(Provide[Container.folder_service])):
    try:
        #tries to get folder from services
        folders = folder_service.get_folders(jwt.jwt_token)
        return FolderResponse(success=True, folders_info=folders)
    except Exception as e:
        #on failure, send back 500 error, server side error
        raise HTTPException(status_code=500, detail=str(e))
    

#add a new folder connected to a user
@router.post("/add", response_model=AddResponse)
@inject
async def addUserFolder(request: AddFolderRequest, folder_service: FolderServices = Depends(Provide[Container.folder_service])):
    try:
        #tries to add new folder
        folder_service.add_folder(request.jwt_token, request.folder_name, request.color)
        return AddResponse(success=True, message="")
    except Exception as e:
        #on failure, send back 500 error, server side error
        raise HTTPException(status_code=500, detail=str(e))
    


#adds a restaurant to a specific user folder
@router.post("/addrestaurant", response_model=AddResponse)
@inject
async def addRestToFolder(request: AddRestaurantRequest, folder_service: FolderServices = Depends(Provide[Container.folder_service])):
    try:
        #tries to add restaurant
        added = folder_service.add_restaurant(request.folder_id, request.restaurant_id, request.rest_name, request.price_range, request.avg_rating, request.loc, request.main_photo_url)
        if added:
            return AddResponse(success=True, message="")
        else:
            #if no error but false, the restaurant already exists in the folder
            return AddResponse(success=False, message="Duplicate entry")
    except Exception as e:
        #on failure, send back 500 error, server side error
        raise HTTPException(status_code=500, detail=str(e))
    

#get the restaurants stored in a folder
@router.post("/contents", response_model=FolderContentsResponse)
@inject
async def getFolderContents(request: FolderContentsRequest, folder_service: FolderServices = Depends(Provide[Container.folder_service])):
    try:
        restaurants = folder_service.get_folder_contents(request.folder_id)
        return FolderContentsResponse(success=True, contents=restaurants)
    except Exception as e:
        #on failure, send back 500 error, server side error occurred
        raise HTTPException(status_code=500, detail=str(e))
    


#adds notes to a specific restaurant
@router.post("/add/notes", response_model=AddResponse)
@inject
async def addRestaurantNotes(request: AddNotesRequest, folder_service: FolderServices = Depends(Provide[Container.folder_service])):
    try:
        #tries to add notes to restaurant
        folder_service.add_restaurant_notes(request.jwt_token, request.restaurant_id, request.user_rating, request.date_visited, request.favorite_dish, request.notes)
        return AddResponse(success=True, message="")
    except Exception as e:
        #on failure, send back 500 error, server side error
        raise HTTPException(status_code=500, detail=str(e))
    

#get notes for a specific user/restaurant
@router.post("/get/notes", response_model=NotesResponse)
@inject
async def getRestaurantNotes(request: NotesRequest, folder_service: FolderServices = Depends(Provide[Container.folder_service])):
    try:
        #tries to retrieve restaurant notes for that user
        notes = folder_service.get_restaurant_notes(request.jwt_token, request.restaurant_id)
        if notes:
            return NotesResponse(success=True, message="", user_notes=notes)
        else:
            #if no error but false, the user has no existing notes for that restaurant
            return NotesResponse(success=False, message="No existing notes", user_notes=None)
    except Exception as e:
        #on failure, send back 500 error, server side error
        raise HTTPException(status_code=500, detail=str(e))

