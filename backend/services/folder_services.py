import hashlib
import jwt
import datetime
from repositories.folder_repository import FolderRepository
from models.user_model import User
from config import settings

class FolderServices:
    def __init__(self, folder_repository):
        self.folder_repository = folder_repository

    #sends info to repository, validates that user exists, and then gets jwt token
    def get_folders(self, jwt_token: str):   
        try: 
            payload = jwt.decode(jwt_token, settings.secret_key, settings.algorithm)
            user_id = payload['user']['id']

            #fetch user from database, raise exception if user not found
            if not user_id:
                raise Exception("Invalid user")
            
            folders = self.folder_repository.get_folders(user_id)
            return folders
        
        except Exception as e:
            raise Exception(f"Failed to retrieve folders: {str(e)}")
        
    