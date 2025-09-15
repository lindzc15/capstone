import hashlib
import jwt
import datetime
from repositories.user_repository import UserRepository
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
            
            user_payload = {
                "username": user.username,
                "name": user.name,
                "email": user.email
            }

            
            #generate JWT token, set to expire in 1 hr
            expiration_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)

            #create payload for token, including subject, expire time, and user info
            token_payload = {
                "sub": user.username,     
                "exp": expiration_time,
                "user": user_payload   
            }

            #create jwt token and return it
            token = jwt.encode(token_payload, settings.secret_key, algorithm=settings.algorithm)

            return token
        
        except Exception as e:
            raise Exception(f"Login failed: {str(e)}")

            