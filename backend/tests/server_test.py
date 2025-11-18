from models.user_model import User, Folder
from schemas.folder_schema import FolderInfo
from container import Container
from controllers import login_controller

import hashlib
from dependency_injector import providers
from fastapi.testclient import TestClient

# -----------------------
# FAKE DATABASES
# -----------------------
fake_db = {
    'test_user': {
        "username": "test_user",
        "full_name": "User",
        "email": "test@test",
        "password_hash": hashlib.sha256("test123".encode()).hexdigest()
    }
}

fake_folder_db = {
    '1': {
        '0': {
            'folder_id': '0',
            'folder_name': "try these!",
            "color": "#FFFFFF",
            "user_id": "1"
        }
    }
}

fake_folder_contents_db = {
    '1': {
        '0': {
            'folder_name': "Test Folder",
            'restaurants': []
        }
    }
}

# -----------------------
# FAKE REPOSITORIES
# -----------------------
class FakeUserRepo:
    def get_user_by_username(self, username):
        user = fake_db.get(username)
        if user:
            return User(
                username=user["username"],
                full_name=user["full_name"],
                email=user["email"],
                password_hash=user["password_hash"]
            )
        return None

class FakeFolderRepo:
    def get_folders(self, user_id):
        folders = fake_folder_db.get(user_id)
        if folders:
            return [
                FolderInfo(
                    folder_id=int(f["folder_id"]),
                    folder_name=f["folder_name"],
                    color=f["color"],
                    user_id=int(f["user_id"]),
                )
                for f in folders.values()
            ]
        return []

# -----------------------
# FAKE SERVICES
# -----------------------
class FakeLoginServices:
    def __init__(self, user_repo):
        self.user_repo = user_repo

    def get_login_token(self, username: str, password: str):
        user = self.user_repo.get_user_by_username(username)
        hashed_pass = hashlib.sha256(password.encode()).hexdigest()
        if user and hashed_pass == user.password_hash:
            return "fake_jwt"
        raise Exception("Invalid credentials")

    def register(self, username, full_name, email, password):
        if username and full_name and email and password:
            if self.user_repo.get_user_by_username(username):
                return False, None, "User already exists"
            return True, "fake_jwt", ""
        raise Exception("Missing required fields")


class FakeFolderServices:
    def __init__(self, folder_repo):
        self.folder_repo = folder_repo

    def get_folders(self, user_id):
        return self.folder_repo.get_folders(user_id)

    def add_folder(self, jwt_token, folder_name, color):
        return True

    def add_restaurant(self, folder_id, restaurant_id, rest_name, price_range, avg_rating, loc, main_photo_url):
        folder = fake_folder_contents_db['1'].get(str(folder_id))
        if not folder:
            return False
        for r in folder['restaurants']:
            if r['restaurant_id'] == restaurant_id:
                return False
        folder['restaurants'].append({
            "restaurant_id": restaurant_id,
            "rest_name": rest_name,
            "loc": loc,
            "price_range": price_range,
            "avg_rating": avg_rating,
            "main_photo_url": main_photo_url,
            "notes": []
        })
        return True

    def get_folder_contents(self, folder_id):
        folder = fake_folder_contents_db['1'].get(str(folder_id))
        if not folder:
            return []
        return [
            {
                "restaurant_id": r["restaurant_id"],
                "rest_name": r["rest_name"],
                "loc": r["loc"],
                "price_range": r["price_range"],
                "avg_rating": r["avg_rating"],
                "main_photo_url": r["main_photo_url"]
            }
            for r in folder["restaurants"]
        ]

    def add_restaurant_notes(self, jwt_token, restaurant_id, user_rating, date_visited, favorite_dish, notes):
        for folder in fake_folder_contents_db['1'].values():
            for r in folder['restaurants']:
                if r['restaurant_id'] == restaurant_id:
                    r['notes'].append({
                        "user_rating": user_rating,
                        "date_visited": date_visited,
                        "favorite_dish": favorite_dish,
                        "notes": notes
                    })
                    return True
        return False

# -----------------------
# OVERRIDES & TEST CLIENT
# -----------------------
from main import app
from dependency_injector.wiring import Provide, inject

app_container = getattr(app, "container", Container())
app.container = app_container

app_container.user_repository.override(providers.Object(FakeUserRepo()))
app_container.login_service.override(providers.Object(FakeLoginServices(FakeUserRepo())))
app_container.folder_repository.override(providers.Object(FakeFolderRepo()))
app_container.folder_service.override(providers.Object(FakeFolderServices(FakeFolderRepo())))

app_container.wire(modules=[login_controller])
client = TestClient(app)

# -----------------------
# RESET FUNCTION
# -----------------------
def reset_fake_db():
    fake_folder_contents_db['1']['0']['restaurants'] = []

# -----------------------
# TESTS
# -----------------------
def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"message": "OK"}

def test_login_endpoint():
    response = client.get("/api/login/")
    assert response.status_code == 200
    assert response.json() == {"message": "login endpoint found!"}

def test_invalid_login():
    response = client.post("/api/login/", json={"username": "test_user", "password": "wrong"})
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid credentials"}

def test_valid_login():
    response = client.post("/api/login/", json={"username": "test_user", "password": "test123"})
    assert response.status_code == 200
    assert response.json() == {"success": True, "jwt_token": "fake_jwt"}

def test_missing_credentials_login():
    response = client.post("/api/login/", json={"username": "test_user"})
    assert response.status_code == 422

def test_successful_register():
    response = client.post("/api/login/register", json={"username": "test_user2","full_name":"Jane Doe","email":"test@test","password":"test123456"})
    assert response.status_code == 200
    assert response.json() == {"success": True, "jwt_token": "fake_jwt", "message": ""}

def test_missing_register():
    response = client.post("/api/login/register", json={"username":"test_user2","full_name":"","email":"test@test","password":"test123456"})
    assert response.status_code == 500
    assert response.json() == {"detail": "Missing required fields"}

def test_existing_register():
    response = client.post("/api/login/register", json={"username":"test_user","full_name":"Jane Doe","email":"test@test","password":"test123456"})
    assert response.status_code == 200
    assert response.json() == {"success": False, "jwt_token": None, "message": "User already exists"}

def test_folder_endpoint():
    response = client.get("/api/folders")
    assert response.status_code == 200
    assert response.json() == {"message": "folders endpoint found!"}

def test_get_existing_folders():
    response = client.post("/api/folders/", json={"jwt_token": "1"})
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "folders_info": [{"folder_id":0,"folder_name":"try these!","color":"#FFFFFF","user_id":1}]
    }

def test_add_folder():
    response = client.post("/api/folders/add", json={"folder_name":"My New Folder","color":"#ABCDEF","jwt_token":"1"})
    assert response.status_code == 200
    assert response.json() == {"success": True,"message": ""}

def test_add_folder_missing_token():
    response = client.post("/api/folders/add", json={"folder_name":"","color":"#ABCDEF"})
    assert response.status_code == 422

def test_add_restaurant_and_duplicate():
    reset_fake_db()
    r1 = client.post("/api/folders/addrestaurant", json={
        "folder_id": 0,"restaurant_id": "rest123","rest_name":"Test Restaurant",
        "loc":"123 Main St","price_range":"$$","avg_rating":4.5,
        "main_photo_url":"http://example.com/photo.jpg"
    })
    assert r1.status_code == 200
    assert r1.json() == {"success": True,"message": ""}
    r2 = client.post("/api/folders/addrestaurant", json={
        "folder_id": 0,"restaurant_id": "rest123","rest_name":"Test Restaurant",
        "loc":"123 Main St","price_range":"$$","avg_rating":4.5,
        "main_photo_url":"http://example.com/photo.jpg"
    })
    assert r2.status_code == 200
    assert r2.json() == {"success": False,"message":"Duplicate entry"}

def test_get_folder_contents():
    reset_fake_db()
    client.post("/api/folders/addrestaurant", json={
        "folder_id":0,"restaurant_id":"rest123","rest_name":"Test Restaurant",
        "loc":"123 Main St","price_range":"$$","avg_rating":4.5,
        "main_photo_url":"http://example.com/photo.jpg"
    })
    response = client.post("/api/folders/contents", json={"folder_id":0})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["contents"][0]["restaurant_id"] == "rest123"

def test_add_restaurant_notes():
    reset_fake_db()
    client.post("/api/folders/addrestaurant", json={
        "folder_id":0,"restaurant_id":"rest123","rest_name":"Test Restaurant",
        "loc":"123 Main St","price_range":"$$","avg_rating":4.5,
        "main_photo_url":"http://example.com/photo.jpg"
    })
    response = client.post("/api/folders/add/notes", json={
        "jwt_token":"1","restaurant_id":"rest123","user_rating":4.7,
        "date_visited":"2025-11-18","favorite_dish":"Pasta","notes":"Really enjoyed the atmosphere!"
    })
    assert response.status_code == 200
    assert response.json() == {"success": True,"message": ""}
    restaurant = fake_folder_contents_db['1']['0']['restaurants'][0]
    assert len(restaurant['notes']) == 1
    assert restaurant['notes'][0]["favorite_dish"] == "Pasta"
