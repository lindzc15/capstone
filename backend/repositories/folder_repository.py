import json
from models.user_model import Folder
from schemas.folder_schema import FolderInfo
from sqlalchemy import select, func
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
            print('made it here')
            self.db.commit()
            print('and here')
            self.db.refresh(folder)
            print('here?')
            return
        except:
            #rollback if any errors creating new account
            self.db.rollback()
            raise Exception("Error creating new folder")
    