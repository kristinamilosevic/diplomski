from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    imdb_id = Column(String(20), unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    year = Column(String(10), nullable=False)
    poster = Column(String, nullable=True)
    type = Column(String(20), nullable=True)
    genre = Column(String, nullable=True)
    plot = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)