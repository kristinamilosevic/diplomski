from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


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
