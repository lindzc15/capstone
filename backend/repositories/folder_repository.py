import json
from models.user_model import Folder, RestaurantFolders, RestaurantInfo
from schemas.folder_schema import FolderInfo, RestaurantInfoSchema
from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session
from typing import Optional, Tuple

from db.db import get_db_session


#database functions concerning authentication
class FolderRepository:
    def __init__(self, db: Session):
        self.db = db


    #retrieves user from database, returning user on success, returning error message on failure
    def get_folders(self, user_id: str) -> list[Folder]:
        try: 
            stmt = select(Folder).where(Folder.user_id == user_id)
            folders = self.db.scalars(stmt).all()
            folder_infos = [FolderInfo(folder_id=str(folder.folder_id), folder_name=str(folder.folder_name), color=str(folder.color), user_id=str(folder.user_id)) for folder in folders]
            return folder_infos   
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Folders not found")
        

    #add new folder to the database, using user id sent in
    def add_folder_db(self, folder: Folder) -> bool:
        try:
            #add new folder to the database, commit, refresh to ensure up to date data, and return 
            self.db.add(folder)
            self.db.commit()
            self.db.refresh(folder)
            return
        except:
            #rollback if any errors creating new account
            self.db.rollback()
            raise Exception("Error creating new folder")
        

    def add_restaurant_db(self, restaurant: RestaurantInfo) -> None:
        try:
            match_rest_count = self.db.scalar(select(func.count()).select_from(RestaurantInfo)
                                                      .where(RestaurantInfo.restaurant_id == restaurant.restaurant_id))
            #restaurant already in database, don't add
            if match_rest_count > 0:
                return
            
            self.db.add(restaurant)
            self.db.commit()
            self.db.refresh(restaurant)
            return
        except Exception as e:
            self.db.rollback()
            print("DB Error:", e)
            raise Exception(f"Error creating restaurant entry")

    
    def add_rest_folder_relation(self, relationship: RestaurantFolders) -> bool:
        try:
            match_realtionship_count = self.db.scalar(
                    select(func.count()).select_from(RestaurantFolders)
                    .where(
                        and_(
                            RestaurantFolders.folder_id == relationship.folder_id,
                            RestaurantFolders.restaurant_id == relationship.restaurant_id
                        )
                    )
                )

            #restaurant already in folder
            if match_realtionship_count > 0:
                return False
            self.db.add(relationship)
            self.db.commit()
            self.db.refresh(relationship)
            return True
        except Exception as e:
            self.db.rollback()
            print("DB Error:", e)
            raise Exception("Error connecting restaurant to folder")
        
    
    def get_folder_contents(self, folder_id: int) -> list[RestaurantInfo]:
        try:
            stmt = select(Folder).where(Folder.folder_id == folder_id)
            folder_count = self.db.scalar(select(func.count()).select_from(Folder).where(Folder.folder_id == folder_id))
            print(folder_count)
            if folder_count == 0:
                raise Exception("Folder does not exist")
            
            stmt = select(RestaurantFolders.restaurant_id).where(RestaurantFolders.folder_id == folder_id)
            restaurant_ids = self.db.scalars(stmt).all()

            if not restaurant_ids:
                return []
        
            stmt2 = select(RestaurantInfo).filter(RestaurantInfo.restaurant_id.in_(restaurant_ids))
            restaurants = self.db.scalars(stmt2).all()
            restaurant_infos = [RestaurantInfoSchema(restaurant_id=str(restaurant.restaurant_id), 
                                               rest_name=str(restaurant.rest_name), 
                                               loc=str(restaurant.loc), 
                                               price_range=str(restaurant.price_range),
                                               avg_rating=float(restaurant.avg_rating),
                                               main_photo_url=str(restaurant.main_photo_url))
                                               for restaurant in restaurants]
            return restaurant_infos
        except Exception as e:
            self.db.rollback()
            print("DB Error:", e)
            raise Exception("Error finding folder contents: ", e)