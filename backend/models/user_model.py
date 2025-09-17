from sqlalchemy import Integer, String, Column

from models.base_model import Base

#creates a mapped class that corresponds to the users table
class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)


    def __init__(self, username: str, name: str, email: str, password_hash: str):
        self.username = username
        self.name = name
        self.email = email
        self.password_hash = password_hash
    

