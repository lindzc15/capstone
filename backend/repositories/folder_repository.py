import json
from models.user_model import Folder, RestaurantFolders, RestaurantInfo, UserRestaurantNotes
from schemas.folder_schema import FolderInfo, RestaurantInfoSchema, NotesInfoSchema
from sqlalchemy import select, func, and_, update
from sqlalchemy.orm import Session
from typing import Optional, Tuple
from sqlalchemy.dialects import postgresql

from db.db import get_db_session


#database functions concerning folders
class FolderRepository:
    def __init__(self, db: Session):
        self.db = db


    #retrieves all folders from database
    def get_folders(self, user_id: str) -> list[Folder]:
        try: 
            stmt = select(Folder).where(Folder.user_id == user_id)
            folders = self.db.scalars(stmt).all()
            folder_infos = [FolderInfo(folder_id=str(folder.folder_id), folder_name=str(folder.folder_name), color=str(folder.color), user_id=str(folder.user_id)) for folder in folders]
            return folder_infos   
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Folders not found")
        

    #add new folder to the database
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
        

    #add new restuarnt to the database
    def add_restaurant_db(self, restaurant: RestaurantInfo) -> None:
        try:
            match_rest_count = self.db.scalar(select(func.count()).select_from(RestaurantInfo)
                                                      .where(RestaurantInfo.restaurant_id == restaurant.restaurant_id))
            #restaurant already in database, don't add, can just add a new folder/restaurant relationship
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

    
    #adds a relationship between a folder and a restaurant to the db
    #allows multiple folders to contain the same restaurant
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

            #restaurant already in folder, return false
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
        
    
    #retreive all restaurants stored in a folder
    def get_folder_contents(self, folder_id: int) -> list[RestaurantInfo]:
        try:
            stmt = select(Folder).where(Folder.folder_id == folder_id)
            folder_count = self.db.scalar(select(func.count()).select_from(Folder).where(Folder.folder_id == folder_id))
            
            #no folder found, don't look for contents
            if folder_count == 0:
                raise Exception("Folder does not exist")
            
            #get ids of restaurants in the folder
            stmt = select(RestaurantFolders.restaurant_id).where(RestaurantFolders.folder_id == folder_id)
            restaurant_ids = self.db.scalars(stmt).all()

            #no restaurants in the folder, don't need to get information on restaurants
            if not restaurant_ids:
                return []
        
            #get restaurant info for each id
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
        

    #adds restaurant notes to a restaurant for a given user
    def add_restaurant_notes(self, user_notes: UserRestaurantNotes):
        try:
            user_rest_notes_count = self.db.scalar(
                    select(func.count()).select_from(UserRestaurantNotes)
                    .where(
                        and_(
                            UserRestaurantNotes.user_id == user_notes.user_id,
                            UserRestaurantNotes.restaurant_id == user_notes.restaurant_id
                        )
                    )
                )
            print("made it here")
            #user already has existing rest notes, do update
            if user_rest_notes_count > 0:
                stmt = (
                    update(UserRestaurantNotes)
                    .where(
                        UserRestaurantNotes.user_id == user_notes.user_id,
                        UserRestaurantNotes.restaurant_id == user_notes.restaurant_id
                    )
                    .values(
                        user_rating=user_notes.user_rating,
                        date_visited=user_notes.date_visited,
                        favorite_dish=user_notes.favorite_dish,
                        notes=user_notes.notes
                    )
                )
                self.db.execute(stmt)
                self.db.commit()
                return
            
            #no existing notes, do insert
            else:
                self.db.add(user_notes)
                self.db.commit()
                self.db.refresh(user_notes)
                return
        except Exception as e:
            self.db.rollback()
            print("DB Error:", e)
            raise Exception("Error adding restaurant notes: ", e)


    def get_restaurant_notes(self, user_id: str, restaurant_id: str):
        try:
            stmt = select(UserRestaurantNotes).where(
                UserRestaurantNotes.user_id == user_id,
                UserRestaurantNotes.restaurant_id == restaurant_id
            )
            result = self.db.execute(stmt).first()

            #user has existing notes, return them
            if result:
                print("made it here")
                row = result[0]
                print(row.user_rating)
                print(row.date_visited)
                print(row.favorite_dish)
                print(row.notes)
                notes = NotesInfoSchema(user_rating=float(row.user_rating), date_visited=str(row.date_visited), favorite_dish=str(row.favorite_dish), notes=str(row.notes))
                return notes
            #no existing notes, return false
            else:
                return False
        except Exception as e:
            self.db.rollback()
            print("DB Error:", e)
            raise Exception("Error retrieving restaurant notes: ", e)