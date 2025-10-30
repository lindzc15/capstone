from dependency_injector import containers, providers

from db.db import get_db_session
from services.login_services import LoginServices
from services.folder_services import FolderServices
from repositories.user_repository import UserRepository
from repositories.folder_repository import FolderRepository


#creates container to hold all services/dependencies to inject into functions
class Container(containers.DeclarativeContainer):
    #gets db session as a resource, as it will need to be opened/closed
    db_session = providers.Resource(get_db_session)


    #uses factory to create new service/repository per request, ensuring isolation of db sessions
    user_repository = providers.Factory(
        UserRepository,
        db = db_session
    )

    folder_repository = providers.Factory(
        FolderRepository,
        db = db_session
    )

    #inserts the created user repository into the service, along with the db session
    login_service = providers.Factory(
        LoginServices,
        user_repository = user_repository
    )

    folder_service = providers.Factory(
        FolderServices,
        folder_repository = folder_repository  
    )
