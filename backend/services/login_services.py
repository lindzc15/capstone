import hashlib
import jwt
import datetime
from repositories.user_repository import UserRepository
from models.user_model import User
from config import settings

class LoginServices:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    #sends info to repository, validates that user exists, and then gets jwt token
    def get_login_token(self, username: str, password: str):   
        try: 
            #fetch user from database, raise exception if user not found
            user = self.user_repository.get_user_by_username(username)
            if not user:
                raise Exception("Invalid credentials")
            

            #hash the password using SHA256
            hashed_pass = hashlib.sha256(password.encode()).hexdigest()


            #verify the hashed passwords match
            if user.password_hash != hashed_pass:
                raise Exception("Invalid credentials")
        

            token = LoginServices.create_token(user.username, user.full_name, user.email, user.user_id)
            return token
        
        except Exception as e:
            raise Exception(f"Login failed: {str(e)}")
        
    #verify that token is valid and hasn't expired
    @staticmethod
    def verify_token(token: str):
        try:
            #decode token and return it
            payload = jwt.decode(token, settings.secret_key, settings.algorithm)
            return payload
        
        except jwt.ExpiredSignatureError:
            raise Exception(f"Token has expired")
        except jwt.InvalidTokenError:
            raise Exception(f"Invalid token")
        except Exception as e:
            raise Exception(f"Failed to verify user")
        

    #user registration, plus will get a token so user can immediately access profile page
    def register(self, username: str, full_name: str, email: str, password: str):
        #all fields are required to register
        if not username or not full_name or not email or not password:
            raise Exception("Missing required fields")

        #hash the password using SHA256
        hashed_pass = hashlib.sha256(password.encode()).hexdigest()
        user = User(username, full_name, email, hashed_pass)


        #send user info to repository for registration
        #if successful get jwt token
        try:
            success, new_user, message = self.user_repository.register_user(user)
            if(success):
                token = LoginServices.create_token(user.username, user.full_name, user.email, user.user_id)
                return success, token, message
            else:
                return success, new_user, message
        except Exception as e:
            print(e)
            raise Exception(f"New user registration failed: {str(e)}")


    #creates a token from user info
    @staticmethod
    def create_token(username: str, name: str, email: str, id: str):
            #user payload to insert into the token
            user_payload = {
                "username": username,
                "name": name,
                "email": email,
                "id": id
            }

            
            #generate JWT token, set to expire in 1 hr
            expiration_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)

            #create payload for token, including subject, expire time, and user info
            token_payload = {
                "sub": username,     
                "exp": expiration_time,
                "user": user_payload   
            }

            #create jwt token and return it
            token = jwt.encode(token_payload, settings.secret_key, algorithm=settings.algorithm)
            
            return token
            