from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.movie import MovieDetail, StoredMovie

WatchlistCategory = Literal["watched", "want_to_watch", "currently_watching"]


class WatchlistAddRequest(BaseModel):
    movie_id: int
    category: WatchlistCategory
    rating: int | None = Field(default=None, ge=1, le=5)
    note: str | None = Field(default=None, max_length=2000)


class WatchlistUpdateRequest(BaseModel):
    category: WatchlistCategory
    rating: int | None = Field(default=None, ge=1, le=5)
    note: str | None = Field(default=None, max_length=2000)


class WatchlistItem(BaseModel):
    id: int
    movie_id: int
    category: WatchlistCategory
    rating: int | None = None
    note: str | None = None
    created_at: datetime
    movie: StoredMovie

    model_config = ConfigDict(from_attributes=True)


class WatchlistDetail(WatchlistItem):
    details: MovieDetail | None = None
