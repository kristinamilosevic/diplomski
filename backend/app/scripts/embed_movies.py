from app.database import SessionLocal
from app.models.movie import Movie
from app.services.embedding_service import embedding_service


def main() -> None:
    db = SessionLocal()
    try:
        movies = db.query(Movie).filter(Movie.embedding.is_(None)).all()
        for index, movie in enumerate(movies, start=1):
            movie.embedding = embedding_service.embed_movie(
                movie.title,
                movie.genre,
                movie.plot,
            )
            print(f"[{index}/{len(movies)}] Embedded {movie.title}")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
