from sqlalchemy import Column, Integer, String
from app.database import Base
from app.models.role import USER


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String(20), nullable=False, default=USER, server_default=USER)
