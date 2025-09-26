from models.user_model import User
from container import Container
from controllers import login_controller


import hashlib
from dependency_injector import providers

# creates fake db
fake_db = {
    'test_user' : {
        "username": "test_user",
        "full_name": "User",
        "email": "test@test",
        "password_hash": "ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae"
    }
}

# fake user repo that will pull from fake db instead of real one
class FakeUserRepo:
    def get_user_by_username(self, username):
        if username in fake_db:
            user = fake_db[username]
            return User(
                username=user["username"],
                full_name=user["full_name"],
                email=user["email"],
                password_hash=user["password_hash"]
            )
        raise Exception("Error finding user account")

# fake login service that will return fake jwt, but still check credentials are valid
class FakeLoginServices:
    def __init__(self, user_repo):
        self.user_repo = user_repo

    def get_login_token(self, username: str, password: str):
        user = self.user_repo.get_user_by_username(username)
        hashed_pass = hashlib.sha256(password.encode()).hexdigest()
        if user and hashed_pass == user.password_hash:
            return "fake_jwt"
        raise Exception("Invalid credentials")
    
# overrides dependencies used
def override_login_service():
    return FakeLoginServices(FakeUserRepo())

def override_user_repo():
    return FakeUserRepo()


    
"""
The following section was made with assistance from AI, as setting up the container and overrides was complex.
I learned that I needed to use the SAME container as the app, rather than creating a new one, or it would still use the container from the actual app & I wouldn't be able to override providers.
Using providers.Object pins the provider to my fake repo and service instances rather than using factory calls for them

I also learned that the test client had to be created AFTER performing overrides and wiring. This ensures the client won't hit real providers before my fake ones are set up
"""

from main import app
try:
    app_container = getattr(app, "container")
except AttributeError:
    app_container = Container()
    app.container = app_container

# override providers on that container (before creating TestClient)
app_container.user_repository.override(providers.Object(FakeUserRepo()))
app_container.login_service.override(providers.Object(FakeLoginServices(FakeUserRepo())))

# ensure controller wiring (harmless if already wired in main.py)
app_container.wire(modules=[login_controller])

from fastapi.testclient import TestClient
client = TestClient(app)





##TESTS

# tests that server is running
def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"message": "OK"}

# test invalid login 
def test_invalid_login():
    response = client.post(
        "/api/login/",
        json={"username": "test_user", "password": "test1234567"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid credentials"}

# test valid login with the test user
def test_valid_login():
    response = client.post(
        "/api/login/",
        json={"username": "test_user", "password": "test123"},
    )
    assert response.status_code == 200
    assert response.json() == {"success": True, "jwt_token": "fake_jwt"}
