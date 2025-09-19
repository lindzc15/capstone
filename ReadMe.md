# Installation requirements

Node, uvicorn, react, PyJWT, pydantic, pydantic settings, run docker compose, start container
sqlalchemy, psycopg2-binary, alembic


test user: test_user
test pass: test123
test email: test123@user

using port 8080 for uvicorn
docker start postgres_capstone_container
docker running on 5433, postgres port in container using 5432

pip install -r requirements.txt, will install everything outlined in requirements.txt


When I update the database models:
alembic revision --autogenerate -m "added menu table"
alembic upgrade head


when professor needs to pull updated table version:
alembic upgrade head