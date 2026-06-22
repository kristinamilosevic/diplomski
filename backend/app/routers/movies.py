from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_admin
from app.models.movie import Movie
from app.models.user import User
from app.schemas.movie import (
    MovieAddRequest,
    MovieDetail,
    MovieSearchItem,
    MovieSearchResponse,
    StoredMovie,
)
from app.services.omdb_service import omdb_service

router = APIRouter(prefix="/movies", tags=["movies"])


@router.post("/add", response_model=StoredMovie, status_code=status.HTTP_201_CREATED)
async def add_movie(
    payload: MovieAddRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    imdb_id = payload.imdb_id.strip()
    existing = db.query(Movie).filter(Movie.imdb_id == imdb_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Movie already exists in the database",
        )

    data = omdb_service.get_movie_details(imdb_id=imdb_id)
    details = MovieDetail.model_validate(data)

    movie = Movie(
        imdb_id=details.imdb_id,
        title=details.title,
        year=details.year,
        poster=details.poster,
        type=details.type,
        genre=details.genre,
        plot=details.plot,
    )
    db.add(movie)
    db.commit()
    db.refresh(movie)
    return movie


@router.get("/search", response_model=MovieSearchResponse, response_model_by_alias=False)
async def search_movies(
    query: str = Query(..., min_length=1, description="Movie title to search for"),
    page: int = Query(1, ge=1, description="Page number for paginated results"),
):
    data = omdb_service.search_movies(query=query, page=page)
    results = [MovieSearchItem.model_validate(item) for item in data.get("Search", [])]
    return MovieSearchResponse(
        results=results,
        total=int(data.get("totalResults", 0)),
    )


@router.get("/{imdb_id}", response_model=MovieDetail, response_model_by_alias=False)
async def get_movie_details(imdb_id: str):
    data = omdb_service.get_movie_details(imdb_id=imdb_id)
    return MovieDetail.model_validate(data)
