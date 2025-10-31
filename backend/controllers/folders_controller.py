from fastapi import APIRouter, HTTPException, Depends


from schemas.folder_schema import FolderInfo, FolderRequest,  FolderResponse, AddFolderRequest, AddResponse, AddRestaurantRequest, FolderContentsRequest, FolderContentsResponse, RestaurantInfoSchema
from schemas.message_schema import MessageResponse
from services.login_services import LoginServices
from services.folder_services import FolderServices
from container import Container
from dependency_injector.wiring import Provide, inject


router = APIRouter(prefix="/api/folders", tags=["Folders"])

#to test that login endpoint is working
@router.get("/", response_model=MessageResponse)
def check_login_endpoint():
    return {"message": "folders endpoint found!"}

#returning user logging in
#uses dependency injection to grab needed services
#uses Depends so FastApi know it needs dependency, Provide to point to the location of the service
@router.post("/", response_model=FolderResponse)
@inject
async def login(jwt: FolderRequest, folder_service: FolderServices = Depends(Provide[Container.folder_service])):
    try:
        #tries to get jwt token from services, if success return it and success message
        folders = folder_service.get_folders(jwt.jwt_token)
        return FolderResponse(success=True, folders_info=folders)
    except Exception as e:
        #on failure, send back 401 error, proper authentication not acquired
        raise HTTPException(status_code=500, detail=str(e))
    

#returning user logging in
#uses dependency injection to grab needed services
#uses Depends so FastApi know it needs dependency, Provide to point to the location of the service
@router.post("/add", response_model=AddResponse)
@inject
async def login(request: AddFolderRequest, folder_service: FolderServices = Depends(Provide[Container.folder_service])):
    try:
        #tries to get jwt token from services, if success return it and success message
        folder_service.add_folder(request.jwt_token, request.folder_name, request.color)
        print('made it hereee')
        return AddResponse(success=True)
    except Exception as e:
        #on failure, send back 401 error, proper authentication not acquired
        raise HTTPException(status_code=500, detail=str(e))
    


#returning user logging in
#uses dependency injection to grab needed services
#uses Depends so FastApi know it needs dependency, Provide to point to the location of the service
@router.post("/addrestaurant", response_model=AddResponse)
@inject
async def login(request: AddRestaurantRequest, folder_service: FolderServices = Depends(Provide[Container.folder_service])):
    try:
        added = folder_service.add_restaurant(request.folder_id, request.restaurant_id, request.rest_name, request.price_range, request.avg_rating, request.loc, request.main_photo_url)
        if added:
            return AddResponse(success=True, message="")
        else:
            return AddResponse(success=False, message="Duplicate entry")
    except Exception as e:
        #on failure, send back 500 error, server side error occurred
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/contents", response_model=FolderContentsResponse)
@inject
async def login(request: FolderContentsRequest, folder_service: FolderServices = Depends(Provide[Container.folder_service])):
    try:
        restaurants = folder_service.get_folder_contents(request.folder_id)
        return FolderContentsResponse(success=True, contents=restaurants)
    except Exception as e:
        #on failure, send back 500 error, server side error occurred
        raise HTTPException(status_code=500, detail=str(e))
    


