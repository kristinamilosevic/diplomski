"""
Script to initialize the database and create tables.
Run this once before starting the application.
"""
from app.database import engine, Base
from app.models.user import User

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()

