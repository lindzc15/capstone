import json
from models.user_model import User
from sqlalchemy import select

from db.db import get_db_session


#database functions concerning authentication
class UserRepository:
    @staticmethod
    #retrieves user from database, returning user on success, returning error message on failure
    def get_user_by_username(username: str) -> User:
        try: 
            # with open("./db/users.json") as file:
            #     data = json.load(file)
            #     for user in data["users"]:
            #         if user["username"] == username:
            #             return User(user["username"], user["name"], user["email"], user["password_hash"])
            session = next(get_db_session())
            stmt = select(User).where(User.username == username)
            user = session.execute(stmt).scalar_one_or_none()
            return user     
        except Exception as e:
            raise Exception(f"Database error: {e}")
        finally:
            if session:
                session.close()
    
    @staticmethod
    #add new user to the database
    def register_user(user: User) -> User:
        user_dict = user.to_dict()

        try: 
            with open("/Users/lindzeycoonradt/Documents/school/capstone/capstone_project/backend/db/users.json") as file:
                data = json.load(file)
                for user in data["users"]:
                    if user["username"] == user_dict["username"]:
                        if user["email"] == user_dict["email"]:
                            raise Exception("Email already registered and username already taken")
                        raise Exception("Username already taken")
                    if user["email"] == user_dict["email"]:
                        raise Exception("Email already registered")
        except FileNotFoundError:
            raise Exception("File not found")
        
        try:
            data["users"].append(user_dict)
        except:
            raise Exception("Unable to add user")
        
        with open("/Users/lindzeycoonradt/Documents/school/capstone/capstone_project/backend/db/users.json", "w") as f:
            json.dump(data, f)

        user = UserRepository.get_user_by_username(user["username"])
        return user