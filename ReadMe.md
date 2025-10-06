# CS 4900 Capstone Project
Let's Eat is my full stack web capstone project. It allows users to browse restaurants, save them to custom folders,
and keep track of their favorite food and things to remember about each restaurant.

## Installation requirements

### Backend
The required dependencies are listed in `backend/requirements.txt`. To install, run these commands from the project root:
 ```
 cd backend
 pip install -r requirements.txt
 ```

### Database
To intially start up the database, docker needs to first be installed. Then run these commands from the project root:
```
docker compose -f docker-compose.yaml up -d
```

To ensure the database is up to date with the current version, run the following command from the project root:
```
cd backend
alembic upgrade head
```

### Frontend
To install the required dependencies, run the these commands from the project root:
```
cd frontend
npm install
```

## Running the application

### Backend
The backend runs on `port 8080` and is specified when running the server. It can be called at `http://127.0.0.1:8080`. To run the backend, run these commands from the project root:
```
cd backend
uvicorn main:app --reload --port 8080
```

### Database
The database runs on `port 5433`, and is specified in `docker-compose.yaml`. I am using PostgreSQL

### Frontend
The frontend runs on `http://localhost:5173/`, with the port specified in `frontend/vite.config.js`. To run the frontend, run these commands from the project root:
```
cd frontend
npm run dev
```


## Running the tests

### Backend/Database
To run the backend and database tests at the same time, run the following commands from the project root:
```
cd backend
python -m pytest
```
Or to run one test file at a time, run the following commands from the project root:
```
cd backend
python -m pytest tests/server_test.py
python -m pytest tests/database_test.py 
```

### Frontend
To run the frontend tests, run the following commands from the project root:
```
cd frontend
npx vitest
```

## Other Notes
- I am using MacOS
- The following user is added in the database setup and can be used for testing:
```
username: test_user
name: User
email: test@test
password: test123
```
- Here are some sample API calls to make for testing purposes
```
http://localhost:8080/
request body: none
return:  {
    "message": "Hello from FastAPI!"
}
```

```
http://localhost:8080/api/login
request body:   {
    "username": "test_user",
    "password": "test123"
}
sample return: 
{
    "success": true,
    "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0X3VzZXIiLCJleHAiOjE3NTg5MDcyNDMsInVzZXIiOnsidXNlcm5hbWUiOiJ0ZXN0X3VzZXIiLCJuYW1lIjoiVXNlciIsImVtYWlsIjoidGVzdEB0ZXN0In19.lLZA8Oa58_ymuPQG8GXVP6s4PJVGA6s8BgPilaC8YJg"
}
```

```
http://localhost:8080/api/login/register
sample request body: {
    "username": "testing123",
    "full_name": "Test User",
    "email": "testing@testing",
    "password": "test123"
}
sample return: {
    "success": true,
    "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0aW5nMTIzIiwiZXhwIjoxNzU4OTA3Mjk1LCJ1c2VyIjp7InVzZXJuYW1lIjoidGVzdGluZzEyMyIsIm5hbWUiOiJUZXN0IFVzZXIiLCJlbWFpbCI6InRlc3RpbmdAdGVzdGluZyJ9fQ.rChX69CKnMb27j-T9bX0HItJg2uYu94WX3R2c2MD22I",
    "message": ""
}
```