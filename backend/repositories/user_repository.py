import json
from models.user_model import User


#database functions concerning authentication
class UserRepository:
    @staticmethod
    #retrieves user from database, returning user on success, returning error message on failure
    def get_user_by_username(username: str) -> User:
        try: 
            with open("./db/users.json") as file:
                data = json.load(file)
                for user in data["users"]:
                    if user["username"] == username:
                        return User(user["username"], user["name"], user["email"], user["password_hash"])
                    
        except FileNotFoundError:
            raise Exception("user file not found")
        return None