from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_user
from app.models.movie import Movie
from app.models.user import User
from app.models.watchlist import UserWatchlist
from app.schemas.movie import MovieDetail, StoredMovie
from app.schemas.watchlist import (
    WatchlistAddRequest,
    WatchlistDetail,
    WatchlistItem,
    WatchlistUpdateRequest,
)
from app.services.omdb_service import omdb_service

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


def _item_response(entry: UserWatchlist, movie: Movie) -> WatchlistItem:
    return WatchlistItem(
        id=entry.id,
        movie_id=entry.movie_id,
        category=entry.category,
        rating=entry.rating,
        note=entry.note,
        created_at=entry.created_at,
        movie=StoredMovie.model_validate(movie),
    )


def _apply_note(note: str | None) -> str | None:
    cleaned = note.strip() if note else None
    return cleaned or None


def _stored_as_detail(movie: Movie) -> MovieDetail:
    return MovieDetail.model_validate(
        {
            "Title": movie.title,
            "Year": movie.year,
            "Genre": movie.genre,
            "Plot": movie.plot,
            "Poster": movie.poster,
            "imdbID": movie.imdb_id,
            "Type": movie.type,
        }
    )


def _with_omdb_details(entry: UserWatchlist, movie: Movie) -> WatchlistDetail:
    item = _item_response(entry, movie)
    try:
        details = MovieDetail.model_validate(omdb_service.get_movie_details(imdb_id=movie.imdb_id))
    except HTTPException:
        details = _stored_as_detail(movie)
    return WatchlistDetail(**item.model_dump(), details=details)


def _get_entry(db: Session, user_id: int, movie_id: int) -> tuple[UserWatchlist, Movie]:
    row = (
        db.query(UserWatchlist, Movie)
        .join(Movie, Movie.id == UserWatchlist.movie_id)
        .filter(UserWatchlist.user_id == user_id, UserWatchlist.movie_id == movie_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist item not found")
    return row


@router.post("", response_model=WatchlistItem, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    payload: WatchlistAddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    movie = db.query(Movie).filter(Movie.id == payload.movie_id).first()
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")

    already = (
        db.query(UserWatchlist)
        .filter(UserWatchlist.user_id == current_user.id, UserWatchlist.movie_id == movie.id)
        .first()
    )
    if already:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Movie already on your watchlist",
        )

    entry = UserWatchlist(
        user_id=current_user.id,
        movie_id=movie.id,
        category=payload.category,
        rating=payload.rating,
        note=_apply_note(payload.note),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _item_response(entry, movie)


@router.get("", response_model=list[WatchlistItem])
async def list_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    rows = (
        db.query(UserWatchlist, Movie)
        .join(Movie, Movie.id == UserWatchlist.movie_id)
        .filter(UserWatchlist.user_id == current_user.id)
        .order_by(UserWatchlist.created_at.desc())
        .all()
    )
    return [_item_response(entry, movie) for entry, movie in rows]


@router.get("/{movie_id}", response_model=WatchlistDetail)
async def get_watchlist_item(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    entry, movie = _get_entry(db, current_user.id, movie_id)
    return _with_omdb_details(entry, movie)


@router.patch("/{movie_id}", response_model=WatchlistDetail)
async def update_watchlist_item(
    movie_id: int,
    payload: WatchlistUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    entry, movie = _get_entry(db, current_user.id, movie_id)
    entry.category = payload.category
    entry.rating = payload.rating
    entry.note = _apply_note(payload.note)
    db.commit()
    db.refresh(entry)
    return _with_omdb_details(entry, movie)
