import json
from models.user_model import Folder, RestaurantFolders, RestaurantInfo
from schemas.folder_schema import FolderInfo
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
                print('DUPLICATE DUPLICATE DUPLICATE DUPLICATE DUPLICATE DUPLICATE DUPLICATE DUPLICATE DUPLICATE')
                return False
            self.db.add(relationship)
            self.db.commit()
            self.db.refresh(relationship)
            return True
        except Exception as e:
            self.db.rollback()
            print("DB Error:", e)
            raise Exception("Error connecting restaurant to folder")