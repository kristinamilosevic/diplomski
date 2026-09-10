from sqlalchemy import Float, Integer, cast, func
from sqlalchemy.orm import Session

from app.models.admin_movie import AdminMovie
from app.models.movie import Movie
from app.schemas.movie import ChatRecommendFilters
from app.services.embedding_service import embedding_service

GENRE_ALIASES = {
    "sci-fi": "Sci-Fi",
    "scifi": "Sci-Fi",
    "science fiction": "Sci-Fi",
    "sf": "Sci-Fi",
    "romcom": "Romance",
    "romantic": "Romance",
    "romcoms": "Romance",
    "cartoon": "Animation",
    "animated": "Animation",
}


def _normalize_genre(genre: str) -> str:
    key = genre.strip()
    return GENRE_ALIASES.get(key.lower(), key)


def _year_expr():
    return cast(func.nullif(func.regexp_replace(Movie.year, r"^.*?(\d{4}).*$", r"\1"), ""), Integer)


def _rating_expr():
    return cast(func.nullif(Movie.imdb_rating, "N/A"), Float)


def apply_catalog_filters(db: Session, filters: ChatRecommendFilters) -> list[Movie]:
    is_in_catalog = (
        db.query(AdminMovie)
        .filter(AdminMovie.movie_id == Movie.id)
        .exists()
    )
    query = db.query(Movie).filter(is_in_catalog)
    year_col = _year_expr()
    rating_col = _rating_expr()

    for genre in filters.genres:
        normalized = _normalize_genre(genre)
        if normalized:
            query = query.filter(Movie.genre.ilike(f"%{normalized}%"))

    for genre in filters.exclude_genres:
        normalized = _normalize_genre(genre)
        if normalized:
            query = query.filter(~func.coalesce(Movie.genre, "").ilike(f"%{normalized}%"))

    if filters.type in {"movie", "series"}:
        query = query.filter(Movie.type == filters.type)

    if filters.min_rating is not None:
        query = query.filter(rating_col >= filters.min_rating)

    if filters.year_from is not None:
        query = query.filter(year_col >= filters.year_from)

    if filters.year_to is not None:
        query = query.filter(year_col <= filters.year_to)

    semantic = (filters.semantic_query or "").strip()
    use_embedding = bool(semantic) or filters.sort == "relevance"
    if use_embedding:
        query = query.filter(Movie.embedding.is_not(None))
        if semantic:
            query = query.order_by(
                Movie.embedding.cosine_distance(embedding_service.embed_query(semantic))
            )
    elif filters.sort == "year_desc":
        query = query.order_by(year_col.desc().nulls_last())
    elif filters.sort == "year_asc":
        query = query.order_by(year_col.asc().nulls_last())
    else:
        query = query.order_by(rating_col.desc().nulls_last())

    return query.limit(filters.limit).all()


def reply_for_results(filters: ChatRecommendFilters, count: int) -> str:
    if count == 0:
        return "No matching titles are available in the catalog."
    parts = [f"Here are {count} title{'s' if count != 1 else ''} from the catalog"]
    if filters.genres:
        parts.append(f"in {', '.join(_normalize_genre(g) for g in filters.genres)}")
    if filters.exclude_genres:
        parts.append(
            f"excluding {', '.join(_normalize_genre(g) for g in filters.exclude_genres)}"
        )
    if filters.min_rating is not None:
        parts.append(f"rated {filters.min_rating}+")
    if filters.year_from and filters.year_to:
        parts.append(f"from {filters.year_from}–{filters.year_to}")
    elif filters.year_from:
        parts.append(f"from {filters.year_from} onward")
    elif filters.year_to:
        parts.append(f"up to {filters.year_to}")
    return " ".join(parts) + "."
