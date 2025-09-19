from config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session



#creates only one engine and session maker for the app
class DatabaseFactory:
    def __init__(self):
        #connects to my postgres database, will print out SQL queries for debugging (echo)
        self.engine = create_engine(settings.database_url, echo=True)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    def get_session(self) -> Session:
        return self.SessionLocal()
    

db_factory = DatabaseFactory()

#yeilds a db session for each request, if error rollsback, then closes session at end
#new sesion for each request ensures isolation of transactions for consistent database state
def get_db_session():
    db = db_factory.get_session()
    try:
        yield db
    except:
        db.rollback()
        raise
    finally:
        db.close()