from sqlalchemy import create_engine, delete
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import IntegrityError
import pytest
from sqlalchemy import select, func
from config import settings
from models.user_model import User

Base = declarative_base()

url = settings.database_url

engine = create_engine(url)
Session = sessionmaker(bind=engine)


class TestDatabase:
    def setup_class(self):
        Base.metadata.create_all(engine)
        self.session = Session()
        self.valid_user = User (
            username="test123",
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
        stmt = select(User).where(User.username == "test123")
        user = self.session.execute(stmt).scalar_one_or_none()
        assert user.username == "test123"
        assert user.full_name == "Testing"
        assert user.email == "test@123"
        assert user.password_hash == "ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae"
        
        #deletes test user after assertions, for ease of running tests again
        stmt = delete(User).where(User.username == "test123")
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