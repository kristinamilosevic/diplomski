from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint

from app.database import Base

WATCHED = "watched"
WANT_TO_WATCH = "want_to_watch"
CURRENTLY_WATCHING = "currently_watching"
WATCHLIST_CATEGORIES = (WATCHED, WANT_TO_WATCH, CURRENTLY_WATCHING)


class UserWatchlist(Base):
    __tablename__ = "user_watchlist"
    __table_args__ = (UniqueConstraint("user_id", "movie_id", name="uq_user_watchlist_user_movie"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(32), nullable=False)
    rating = Column(Integer, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
