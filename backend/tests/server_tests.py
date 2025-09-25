from models.user_model import User
from container import Container
from controllers import login_controller
from config import settings


fake_db = {
    'test_user' : {"user_id": 1, "username": "test_user", "full_name": "User", "email": "test@test", "password": "test123"}
}

class FakeUserRepo:
    def get_user_by_username(self, username):
        if username in fake_db:
            user = fake_db[username]
            return User(
                user_id= user["user_id"],
                username= user["username"],
                full_name= user["full_name"],
                email= user["email"],
                password_hash= user["password"] 
            )
        raise Exception("Error finding user account")
    
class FakeLoginServices:
    def __init__(self, user_repo):
        self.user_repo = user_repo

    def get_login_token(self, username: str, password: str):
        user = self.user_repo.get_user_by_username(username)
        if user and password == user.password_hash:
            return "fake_jwt"
        raise Exception("Invalid credentials")

def override_login_service():
    return FakeLoginServices(FakeUserRepo())

def override_user_repo():
    return FakeUserRepo()

container = Container()
container.login_service.override(lambda:FakeLoginServices(FakeUserRepo()))
container.user_repository.override(lambda: FakeUserRepo())
container.wire(modules=[login_controller])

from main import app 
from fastapi.testclient import TestClient
client = TestClient(app)


#tests that server is running
def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"message": "OK"}


#test invalid login 
def test_invalid_login():
    response = client.post(
        "/api/login/",
        json={"username": "test_user", "password": "test1234567"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Login failed: Invalid credentials"}




#test valid login with the test user
# def test_valid_login():
#     response = client.post(
#         "/api/login/",
#         json={"username": "test_user", "password": "test123"},
#     )
#     assert response.status_code == 200
#     assert response.json() == {"success": True, "jwt_token": "fake_jwt"}