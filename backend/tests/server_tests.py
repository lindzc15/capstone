from models.user_model import User
from container import Container
from controllers import login_controller
from config import settings

import hashlib
from dependency_injector import providers

# creates fake db
fake_db = {
    'test_user' : {
        "username": "test_user",
        "full_name": "User",
        "email": "test@test",
        # store PLAIN password here; we will hash it when creating the User
        "password": "test123"
    }
}

# fake user repo that will pull from fake db instead of real one
class FakeUserRepo:
    def get_user_by_username(self, username):
        if username in fake_db:
            user = fake_db[username]
            # Build SQLAlchemy User correctly: it expects username, full_name, email, password_hash
            hashed = hashlib.sha256(user["password"].encode()).hexdigest()
            return User(
                username=user["username"],
                full_name=user["full_name"],
                email=user["email"],
                password_hash=hashed
            )
        raise Exception("Error finding user account")

# fake login service that will return fake jwt, but still check credentials are valid
class FakeLoginServices:
    def __init__(self, user_repo):
        self.user_repo = user_repo

    def get_login_token(self, username: str, password: str):
        user = self.user_repo.get_user_by_username(username)
        # hash incoming password like the real service
        hashed_pass = hashlib.sha256(password.encode()).hexdigest()
        if user and hashed_pass == user.password_hash:
            return "fake_jwt"
        raise Exception("Invalid credentials")

# overrides dependencies used
def override_login_service():
    return FakeLoginServices(FakeUserRepo())

def override_user_repo():
    return FakeUserRepo()

# IMPORTANT: use the SAME container instance the app uses
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
