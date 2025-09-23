import json
from models.user_model import User
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from typing import Optional, Tuple

from db.db import get_db_session


#database functions concerning authentication
class UserRepository:
    def __init__(self, db: Session):
        self.db = db


    #retrieves user from database, returning user on success, returning error message on failure
    def get_user_by_username(self, username: str) -> User:
        try: 
            stmt = select(User).where(User.username == username)
            user = self.db.execute(stmt).scalar_one_or_none()
            return user     
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Error finding user account")
    

    #add new user to the database
    def register_user(self, user: User) -> Tuple[bool, Optional[User], str]:
        try: 
            #checks to see if username or email exists
            match_usernames_count = self.db.scalar(select(func.count()).select_from(User).where(User.username == user.username))
            match_email_count = self.db.scalar(select(func.count()).select_from(User).where(User.email == user.email))

            #if either username or email or both already in use, send error
            if match_usernames_count > 0:
                if match_email_count > 0:
                    return False, None, "Email already registered and username already taken"
                return False, None, "Username already taken"
            if match_email_count > 0:
                return False, None, "Email already registered"
            
        except Exception as e:
            raise Exception(f"Error completing registration")
        
        try:
            #add new user to the database, commit, refresh to ensure up to date data, and return the created user
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            return True, user, ""
        except:
            #rollback if any errors creating new account
            self.db.rollback()
            raise Exception("Error creating new account")
        