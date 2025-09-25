# Installation requirements

Node, uvicorn, react, PyJWT, pydantic, pydantic settings, run docker compose, start container
sqlalchemy, psycopg2-binary, alembic, dependency injector, pytest, httpx

npm run dev for frontend -- specify port
uvicorn main:app --reload --port 8080 for backend


test user: test_user
test pass: test123
test email: test123@user

using port 8080 for uvicorn
use port 5173 for frontend (can change in vite.config.js if needed)
docker start postgres_capstone_container
docker running on 5433, postgres port in container using 5432

pip install -r requirements.txt, will install everything outlined in requirements.txt


When updating the database models:
alembic revision --autogenerate -m "added menu table"
*add any new models to the env.py file
alembic upgrade head


when professor needs to pull updated table version:
alembic upgrade head

run tests:
- database: pytest tests/database_tests.py.  *tests adding user, must then remove the user*