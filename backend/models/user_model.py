from sqlalchemy import Integer, String, Column, ForeignKey, Numeric
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
    folders = relationship("Folder", back_populates="user", cascade="all, delete-orphan")


    def __init__(self, username: str, full_name: str, email: str, password_hash: str):
        self.username = username
        self.full_name = full_name
        self.email = email
        self.password_hash = password_hash
    


#creates a mapped class that corresponds to the folders table
class Folder(Base):
    __tablename__ = 'folders'
    folder_id = Column(Integer, primary_key=True, autoincrement=True)
    folder_name = Column(String(100), nullable=False)
    color = Column(String(7), nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    user = relationship("User", back_populates="folders")

    restaurants = relationship(
        "RestaurantInfo",
        secondary="restaurant_folders",
        back_populates="folders"
    )


    def __init__(self, folder_name: str, color: Optional[str], user_id: int):
        self.folder_name = folder_name
        self.color = color
        self.user_id = user_id


#creates a mapped class that corresponds to the restaurant info table
class RestaurantInfo(Base):
    __tablename__ = 'restaurant_info'
    restaurant_id = Column(String, primary_key=True)
    price_range = Column(String(20))
    rest_name = Column(String(100), nullable=False)
    avg_rating = Column(Numeric(2,1))
    loc = Column(String(255), nullable=False)
    main_photo_url = Column(String(1000))

    folders = relationship(
        "Folder",
        secondary="restaurant_folders",
        back_populates="restaurants"
    )

    def __init__(self, restaurant_id: str, price_range: Optional[str], rest_name: str, avg_rating: Optional[float], loc: str, main_photo_url: Optional[str]):
        self.restaurant_id = restaurant_id
        self.price_range = price_range
        self.rest_name = rest_name
        self.avg_rating = avg_rating
        self.loc = loc
        self.main_photo_url = main_photo_url



#creates a mapped class that corresponds to the restaurant folders table
class RestaurantFolders(Base):
    __tablename__ = "restaurant_folders"
    folder_id = Column(Integer, ForeignKey("folders.folder_id"), nullable=False, primary_key=True)
    restaurant_id = Column(String, ForeignKey("restaurant_info.restaurant_id"), nullable=False, primary_key=True)

    def __init__(self, folder_id: int, restaurant_id: str):
        self.folder_id = folder_id
        self.restaurant_id = restaurant_id

    