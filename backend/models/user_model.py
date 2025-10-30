from sqlalchemy import Integer, String, Column, ForeignKey
from sqlalchemy.orm import Mapped, DeclarativeBase, mapped_column, relationship

from models.base_model import Base
from typing import Optional

#creates a mapped class that corresponds to the users table
class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    children = relationship("Folder", back_populates="parent")


    def __init__(self, username: str, full_name: str, email: str, password_hash: str):
        self.username = username
        self.full_name = full_name
        self.email = email
        self.password_hash = password_hash
    


#creates a mapped class that corresponds to the users table
class Folder(Base):
    __tablename__ = 'folders'
    folder_id = Column(Integer, primary_key=True, autoincrement=True)
    folder_name = Column(String(100), nullable=False)
    color = Column(String(7), nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    parent = relationship("User", back_populates="children")


    def __init__(self, folder_name: str, color: Optional[str], user_id: int):
        self.folder_name = folder_name
        self.color = color
        self.user_id = user_id