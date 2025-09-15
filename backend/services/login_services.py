import hashlib
import jwt
import datetime
from repositories.user_repository import UserRepository

class UserServices:
    @staticmethod
    def get_login_token(username, pass_hash):   
        try: 
            user = UserRepository.get_user_by_username(username)
            