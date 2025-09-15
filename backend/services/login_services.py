import hashlib
import jwt
import datetime
from repositories.user_repository import UserRepository
from models.user_model import User
from config import settings

class LoginServices:
    @staticmethod
    def get_login_token(username: str, password: str):   
        try: 
            #fetch user from database, raise exception if user not found
            user = UserRepository.get_user_by_username(username)
            if not user:
                raise Exception("User not found")
            

            #hash the password using SHA256
            hashed_pass = hashlib.sha256(password.encode()).hexdigest()


            #verify the hashed passwords match
            if user.password_hash != hashed_pass:
                raise Exception("Invalid credentials")
        

            token = LoginServices.create_token(user.username, user.name, user.email)
            return token
        
        except Exception as e:
            raise Exception(f"Login failed: {str(e)}")
        
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
        
    @staticmethod
    def register(username: str, name: str, email: str, password: str):
        if not username or not name or not email or not password:
            raise Exception("Missing required fields")
        
        #hash the password using SHA256
        hashed_pass = hashlib.sha256(password.encode()).hexdigest()
        user = User(username, name, email, hashed_pass)

        #create the user
        try:
            new_user = UserRepository.register_user(user)
            token = LoginServices.create_token(new_user.username, new_user.name, new_user.email)
            return token
        except Exception as e:
            raise Exception(f"New user registration failed: {str(e)}")


    @staticmethod
    def create_token(username: str, name: str, email: str):
            user_payload = {
                "username": username,
                "name": name,
                "email": email
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
            