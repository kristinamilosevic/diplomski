from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MovieSearchItem(BaseModel):
    title: str = Field(alias="Title")
    year: str = Field(alias="Year")
    imdb_id: str = Field(alias="imdbID")
    type: str = Field(alias="Type")
    poster: str | None = Field(default=None, alias="Poster")

    model_config = ConfigDict(populate_by_name=True, ser_json_by_alias=False)


class MovieSearchResponse(BaseModel):
    results: list[MovieSearchItem]
    total: int


class MovieDetail(BaseModel):
    title: str = Field(alias="Title")
    year: str = Field(alias="Year")
    rated: str | None = Field(default=None, alias="Rated")
    released: str | None = Field(default=None, alias="Released")
    runtime: str | None = Field(default=None, alias="Runtime")
    genre: str | None = Field(default=None, alias="Genre")
    director: str | None = Field(default=None, alias="Director")
    writer: str | None = Field(default=None, alias="Writer")
    actors: str | None = Field(default=None, alias="Actors")
    plot: str | None = Field(default=None, alias="Plot")
    language: str | None = Field(default=None, alias="Language")
    country: str | None = Field(default=None, alias="Country")
    awards: str | None = Field(default=None, alias="Awards")
    poster: str | None = Field(default=None, alias="Poster")
    imdb_id: str = Field(alias="imdbID")
    imdb_rating: str | None = Field(default=None, alias="imdbRating")
    imdb_votes: str | None = Field(default=None, alias="imdbVotes")
    type: str | None = Field(default=None, alias="Type")
    box_office: str | None = Field(default=None, alias="BoxOffice")
    production: str | None = Field(default=None, alias="Production")

    model_config = ConfigDict(populate_by_name=True, ser_json_by_alias=False)


class MovieAddRequest(BaseModel):
    imdb_id: str = Field(..., min_length=1)


class MovieRecommendationRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500)
    limit: int = Field(default=5, ge=1, le=10)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=500)


class ChatRecommendRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1, max_length=8)


class ChatRecommendFilters(BaseModel):
    limit: int = Field(default=5, ge=1, le=10)
    genres: list[str] = Field(default_factory=list)
    exclude_genres: list[str] = Field(default_factory=list)
    type: str | None = None
    min_rating: float | None = Field(default=None, ge=0, le=10)
    year_from: int | None = Field(default=None, ge=1880, le=2100)
    year_to: int | None = Field(default=None, ge=1880, le=2100)
    sort: Literal["rating_desc", "year_desc", "year_asc", "relevance"] = "rating_desc"
    semantic_query: str | None = Field(default=None, max_length=300)

    @field_validator("type", "semantic_query", mode="before")
    @classmethod
    def empty_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("genres", "exclude_genres", mode="before")
    @classmethod
    def drop_blank_genres(cls, value: object) -> object:
        if not isinstance(value, list):
            return value
        return [item for item in value if isinstance(item, str) and item.strip()]


class StoredMovie(BaseModel):
    id: int
    imdb_id: str
    title: str
    year: str
    poster: str | None = None
    type: str | None = None
    genre: str | None = None
    plot: str | None = None
    imdb_rating: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CatalogMovieDetail(BaseModel):
    movie: StoredMovie
    details: MovieDetail | None = None


class ChatRecommendResponse(BaseModel):
    reply: str
    filters: ChatRecommendFilters
    movies: list[StoredMovie]
