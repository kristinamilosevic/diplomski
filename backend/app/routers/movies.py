from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db, require_admin
from app.models.admin_movie import AdminMovie
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
    current_user: User = Depends(require_admin),
):
    imdb_id = payload.imdb_id.strip()
    movie = db.query(Movie).filter(Movie.imdb_id == imdb_id).first()
    if not movie:
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
        db.flush()

    already = (
        db.query(AdminMovie)
        .filter(AdminMovie.user_id == current_user.id, AdminMovie.movie_id == movie.id)
        .first()
    )
    if already:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already added this title",
        )

    db.add(AdminMovie(user_id=current_user.id, movie_id=movie.id))
    db.commit()
    db.refresh(movie)
    return movie


@router.get("/mine", response_model=list[StoredMovie])
async def list_my_movies(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Titles this admin added. Other admins may have added the same imdb ids."""
    return (
        db.query(Movie)
        .join(AdminMovie, AdminMovie.movie_id == Movie.id)
        .filter(AdminMovie.user_id == current_user.id)
        .order_by(AdminMovie.created_at.desc())
        .all()
    )


@router.get("", response_model=list[StoredMovie])
async def list_movies(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Catalog of titles added by any admin. One row per movie even if several admins added it."""
    return (
        db.query(Movie)
        .join(AdminMovie, AdminMovie.movie_id == Movie.id)
        .distinct()
        .order_by(Movie.created_at.desc())
        .all()
    )


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
