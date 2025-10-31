import hashlib
import jwt
import datetime
from repositories.folder_repository import FolderRepository
from models.user_model import Folder, RestaurantFolders, RestaurantInfo
from schemas.folder_schema import RestaurantInfoSchema
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
        
    
        #sends info to repository, validates that user exists, and then gets jwt token
    def add_folder(self, jwt_token: str, folder_name: str, color: str):   
        try: 
            payload = jwt.decode(jwt_token, settings.secret_key, settings.algorithm)
            user_id = payload['user']['id']

            #fetch user from database, raise exception if user not found
            if not user_id:
                raise Exception("Invalid user")
            
            folder = Folder(folder_name, color, user_id)
            
            self.folder_repository.add_folder_db(folder)
            return
        
        except Exception as e:
            raise Exception(f"Failed to add folder: {str(e)}")
        


    def add_restaurant(self, folder_id: str, restaurant_id: str, rest_name: str, price_range: str, avg_rating: float, loc: str, main_photo_url: str) -> bool:   
        try: 
            #create restaurant with given fields
            restaurant = RestaurantInfo(restaurant_id, price_range, rest_name, avg_rating, loc, main_photo_url)

            #add restaurant to db if not already in it, restaurant info table
            self.folder_repository.add_restaurant_db(restaurant)

            #add relationship to db, restaurant_folders
            relationship = RestaurantFolders(folder_id, restaurant_id)
            relation_added = self.folder_repository.add_rest_folder_relation(relationship)

            #relationship already exists, let user know about duplicate in folder
            if not relation_added:
                return False

            return True
        
        except Exception as e:
            raise Exception(f"Failed to add restaurant to folder: {str(e)}")
        
    
    def get_folder_contents(self, folder_id: int) -> list[RestaurantInfoSchema]:
        try:
            restaurant_list = self.folder_repository.get_folder_contents(folder_id)
            return restaurant_list
        except Exception as e:
            raise Exception(f"Failed to retrieve folder contents: {str(e)}")
        
    