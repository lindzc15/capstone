from sqlalchemy import create_engine, delete
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import IntegrityError
import pytest
from sqlalchemy import select, func
from config import settings
from models.user_model import User, Folder, RestaurantInfo, RestaurantFolders, UserRestaurantNotes
import hashlib

Base = declarative_base()

url = settings.database_url

engine = create_engine(url)
Session = sessionmaker(bind=engine)


#handles set up/take down for db, plus provides a test user
class TestDatabase:
    def setup_class(self):
        Base.metadata.create_all(engine)
        self.session = Session()
        self.valid_user = User (
            username="test123456",
            full_name="Testing",
            email="test@123",
            password_hash="ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae"
        )

    def teardown_class(self):
        self.session.rollback()
        self.session.close()


    #tests adding test user and then selecting it, ensuring credentials get set/returned as expected
    def test_get_by_user_success(self):
        self.session.add(self.valid_user)
        self.session.commit()
        stmt = select(User).where(User.username == "test123456")
        user = self.session.execute(stmt).scalar_one_or_none()
        assert user.username == "test123456"
        assert user.full_name == "Testing"
        assert user.email == "test@123"
        assert user.password_hash == "ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae"
        
        #deletes test user after assertions, for ease of running tests again
        stmt = delete(User).where(User.username == "test123456")
        self.session.execute(stmt)
        self.session.commit()


    #tests retreiving a user that doesn't exist
    def test_get_user_no_exist(self):
        stmt = select(User).where(User.username == "noExist")
        user = self.session.execute(stmt).scalar_one_or_none()
        assert user is None


    #test adding a user without all required fields, missing the password
    @pytest.mark.xfail(raises=TypeError)
    def test_add_user_no_pass(self):
        invalid_user = User (
                username="test123",
                full_name="Testing",
                email="test@123",
            )
        self.session.add(invalid_user)
        try:
            self.session.commit()
        except TypeError:
            self.session.rollback()

    
    def test_add_and_get_folder_db(self):
            # Create user
            user = User(username="folderuser123123", full_name="Folder Test", email="folder@example.com", password_hash="hashed")
            self.session.add(user)
            self.session.commit()

            # Add folder
            folder = Folder(folder_name="My Folder", color="#ABCDEF", user_id=user.user_id)
            self.session.add(folder)
            self.session.commit()

            stmt = select(Folder).where(Folder.user_id == user.user_id)
            db_folder = self.session.execute(stmt).scalar_one()
            assert db_folder.folder_name == "My Folder"
            assert db_folder.color == "#ABCDEF"

            # cleanup
            self.session.execute(delete(Folder).where(Folder.user_id == user.user_id))
            self.session.execute(delete(User).where(User.user_id == user.user_id))
            self.session.commit()

    #test adding a folder without all required fields, missing the user id
    @pytest.mark.xfail(raises=IntegrityError)
    def test_add_folder_no_user_id(self):
        # Create user
        user = User(username="folderuser12379", full_name="Folder Test", email="folder@example.com", password_hash="hashed")
        self.session.add(user)
        self.session.commit()

        try:
            # Add folder without user_id
            folder = Folder(folder_name="My Folder", color="#ABCDEF", user_id=None)
            self.session.add(folder)
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise
        finally:
            self.session.execute(delete(User).where(User.user_id == user.user_id))
            self.session.commit()


    #tests retreiving a folder that doesn't exist
    def test_get_folder_no_exist(self):
        stmt = select(Folder).where(Folder.user_id == 999382832938)
        user = self.session.execute(stmt).scalar_one_or_none()
        assert user is None


    def test_add_and_get_restaurant_in_folder(self):
            # Create user
            user = User(username="restuser123", full_name="Rest Test", email="rest@example.com", password_hash="hashed")
            self.session.add(user)
            self.session.commit()

            # Create folder
            folder = Folder(folder_name="Rest Folder", color="#123456", user_id=user.user_id)
            self.session.add(folder)
            self.session.commit()

            # Create restaurant
            restaurant = RestaurantInfo(
                restaurant_id="rest001",
                price_range="$$",
                rest_name="Test Restaurant",
                avg_rating=4.5,
                loc="123 Main St",
                main_photo_url="http://example.com/photo.jpg"
            )
            self.session.add(restaurant)
            self.session.commit()

            # Link restaurant to folder
            rf = RestaurantFolders(folder_id=folder.folder_id, restaurant_id=restaurant.restaurant_id)
            self.session.add(rf)
            self.session.commit()

            # Verify restaurant is linked
            stmt = select(RestaurantInfo).join(RestaurantFolders).where(RestaurantFolders.folder_id == folder.folder_id)
            db_rest = self.session.execute(stmt).scalar_one()
            assert db_rest.restaurant_id == "rest001"
            assert db_rest.rest_name == "Test Restaurant"

            # cleanup
            self.session.execute(delete(RestaurantFolders).where(RestaurantFolders.folder_id == folder.folder_id))
            self.session.execute(delete(RestaurantInfo).where(RestaurantInfo.restaurant_id == restaurant.restaurant_id))
            self.session.execute(delete(Folder).where(Folder.folder_id == folder.folder_id))
            self.session.execute(delete(User).where(User.user_id == user.user_id))
            self.session.commit()

    #tests retreiving a restaurant that doesn't exist
    def test_get_restaurant_no_exist(self):
        stmt = select(RestaurantInfo).where(RestaurantInfo.restaurant_id == 'thisisfake')
        user = self.session.execute(stmt).scalar_one_or_none()
        assert user is None


    def test_add_and_get_restaurant_notes(self):
        # Create user
        user = User(username="noteuser1212", full_name="Note Test", email="note@example.com", password_hash="hashed")
        self.session.add(user)
        self.session.commit()

        # Create restaurant
        restaurant = RestaurantInfo(
            restaurant_id="note_rest00123",
            price_range="$$",
            rest_name="Note Restaurant",
            avg_rating=5.0,
            loc="456 Elm St",
            main_photo_url=None
        )
        self.session.add(restaurant)
        self.session.commit()

        # Add notes
        notes = UserRestaurantNotes(
            user_id=user.user_id,
            restaurant_id=restaurant.restaurant_id,
            user_rating=4.0,
            date_visited="2025-11-18",
            favorite_dish="Pasta",
            notes="Great service!"
        )
        self.session.add(notes)
        self.session.commit()

        stmt = select(UserRestaurantNotes).where(
            UserRestaurantNotes.user_id == user.user_id,
            UserRestaurantNotes.restaurant_id == restaurant.restaurant_id
        )
        db_notes = self.session.execute(stmt).scalar_one()
        assert db_notes.favorite_dish == "Pasta"
        assert db_notes.notes == "Great service!"
        assert float(db_notes.user_rating) == 4.0

        # cleanup
        self.session.execute(delete(UserRestaurantNotes).where(
            UserRestaurantNotes.user_id == user.user_id,
            UserRestaurantNotes.restaurant_id == restaurant.restaurant_id
        ))
        self.session.execute(delete(RestaurantInfo).where(RestaurantInfo.restaurant_id == restaurant.restaurant_id))
        self.session.execute(delete(User).where(User.user_id == user.user_id))
        self.session.commit()

    def test_update_restaurant_notes(self):
        # Create user
        user = User(username="updateuser", full_name="Update Test", email="update@example.com", password_hash="hashed")
        self.session.add(user)
        self.session.commit()

        # Create restaurant
        restaurant = RestaurantInfo(
            restaurant_id="update_rest001",
            price_range="$$$",
            rest_name="Update Restaurant",
            avg_rating=3.5,
            loc="789 Oak St",
            main_photo_url=None
        )
        self.session.add(restaurant)
        self.session.commit()

        # Add initial notes
        notes = UserRestaurantNotes(
            user_id=user.user_id,
            restaurant_id=restaurant.restaurant_id,
            user_rating=3.0,
            date_visited="2025-11-18",
            favorite_dish="Salad",
            notes="Good experience."
        )
        self.session.add(notes)
        self.session.commit()

        # Update notes
        stmt = select(UserRestaurantNotes).where(
            UserRestaurantNotes.user_id == user.user_id,
            UserRestaurantNotes.restaurant_id == restaurant.restaurant_id
        )
        db_notes = self.session.execute(stmt).scalar_one()
        db_notes.user_rating = 4.5
        db_notes.favorite_dish = "Steak"
        db_notes.notes = "Excellent experience!"
        self.session.commit()

        # Verify update
        updated_notes = self.session.execute(stmt).scalar_one()
        assert float(updated_notes.user_rating) == 4.5
        assert updated_notes.favorite_dish == "Steak"
        assert updated_notes.notes == "Excellent experience!"

        # cleanup
        self.session.execute(delete(UserRestaurantNotes).where(
            UserRestaurantNotes.user_id == user.user_id,
            UserRestaurantNotes.restaurant_id == restaurant.restaurant_id
        ))
        self.session.execute(delete(RestaurantInfo).where(RestaurantInfo.restaurant_id == restaurant.restaurant_id))
        self.session.execute(delete(User).where(User.user_id == user.user_id))
        self.session.commit()
