from fastapi import APIRouter, HTTPException, Depends


from schemas.folder_schema import FolderInfo, FolderRequest,  FolderResponse, AddFolderRequest, AddFolderResponse
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
@router.post("/add", response_model=AddFolderResponse)
@inject
async def login(request: AddFolderRequest, folder_service: FolderServices = Depends(Provide[Container.folder_service])):
    try:
        #tries to get jwt token from services, if success return it and success message
        folder_service.add_folder(request.jwt_token, request.folder_name, request.color)
        print('made it hereee')
        return AddFolderResponse(success=True)
    except Exception as e:
        #on failure, send back 401 error, proper authentication not acquired
        raise HTTPException(status_code=500, detail=str(e))