import logging

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.admin_movie import AdminMovie
from app.models.movie import Movie
from app.models.role import ADMIN, USER
from app.models.user import User
from app.schemas.movie import MovieDetail
from app.services.embedding_service import embedding_service
from app.services.omdb_service import omdb_service
from app.utils.password import hash_password

logger = logging.getLogger(__name__)

SEED_PASSWORD = "Password123"

SEED_USERS = (
    ("admin1@gmail.com", ADMIN),
    ("admin2@gmail.com", ADMIN),
    ("ana@gmail.com", USER),
    ("pera@gmail.com", USER),
    ("sara@gmail.com", USER),
)

TITLES_PER_ADMIN = 50

ADMIN1_IMDB_IDS = (
    "tt0111161",  # The Shawshank Redemption
    "tt0068646",  # The Godfather
    "tt0468569",  # The Dark Knight
    "tt0071562",  # The Godfather Part II
    "tt0167260",  # The Lord of the Rings: The Return of the King
    "tt0110912",  # Pulp Fiction
    "tt0108052",  # Schindler's List
    "tt1375666",  # Inception
    "tt0137523",  # Fight Club
    "tt0109830",  # Forrest Gump
    "tt0114369",  # Se7en
    "tt0133093",  # The Matrix
    "tt0120737",  # The Lord of the Rings: The Fellowship of the Ring
    "tt0167261",  # The Lord of the Rings: The Two Towers
    "tt0816692",  # Interstellar
    "tt0110413",  # Léon: The Professional
    "tt0080684",  # The Empire Strikes Back
    "tt0076759",  # Star Wars
    "tt0102926",  # The Silence of the Lambs
    "tt0073486",  # One Flew Over the Cuckoo's Nest
    "tt0120815",  # Saving Private Ryan
    "tt0317248",  # City of God
    "tt0245429",  # Spirited Away
    "tt0120689",  # The Green Mile
    "tt0118799",  # Life Is Beautiful
    "tt0110357",  # The Lion King
    "tt0172495",  # Gladiator
    "tt0120586",  # American History X
    "tt0407887",  # The Departed
    "tt0482571",  # The Prestige
    "tt0088763",  # Back to the Future
    "tt1853728",  # Django Unchained
    "tt0993846",  # The Wolf of Wall Street
    "tt0361748",  # Inglourious Basterds
    "tt1130884",  # Shutter Island
    "tt0209144",  # Memento
    "tt0119217",  # Good Will Hunting
    "tt0082971",  # Raiders of the Lost Ark
    "tt0078748",  # Alien
    "tt0081505",  # The Shining
    "tt0050083",  # 12 Angry Men
    "tt0047478",  # Seven Samurai
    "tt0099685",  # Goodfellas
    "tt2582802",  # Whiplash
    "tt1392190",  # Mad Max: Fury Road
    "tt0054215",  # Psycho
    "tt0034583",  # Casablanca
    "tt0060196",  # The Good, the Bad and the Ugly
    "tt0114814",  # The Usual Suspects
    "tt0435761",  # Toy Story 3
)

ADMIN2_IMDB_IDS = (
    "tt0903747",  # Breaking Bad
    "tt0944947",  # Game of Thrones
    "tt3032476",  # Better Call Saul
    "tt1475582",  # Sherlock
    "tt0141842",  # The Sopranos
    "tt0306414",  # The Wire
    "tt0386676",  # The Office
    "tt0108778",  # Friends
    "tt2085059",  # Black Mirror
    "tt7366338",  # Chernobyl
    "tt4574334",  # Stranger Things
    "tt2442560",  # Peaky Blinders
    "tt5753856",  # Dark
    "tt2707408",  # Narcos
    "tt4158110",  # Mr. Robot
    "tt2802850",  # Fargo
    "tt0185906",  # Band of Brothers
    "tt2861424",  # Rick and Morty
    "tt0096697",  # The Simpsons
    "tt0412142",  # House
    "tt8111088",  # The Mandalorian
    "tt3581920",  # The Last of Us
    "tt11126994",  # Arcane
    "tt1190634",  # The Boys
    "tt0475784",  # Westworld
    "tt2306299",  # Vikings
    "tt4786824",  # The Crown
    "tt0773262",  # Dexter
    "tt2560140",  # Attack on Titan
    "tt0213338",  # Cowboy Bebop
    "tt4154796",  # Avengers: Endgame
    "tt15398776",  # Oppenheimer
    "tt1160419",  # Dune
    "tt7286456",  # Joker
    "tt6710474",  # Everything Everywhere All at Once
    "tt0499549",  # Avatar
    "tt0120338",  # Titanic
    "tt0114709",  # Toy Story
    "tt1049413",  # Up
    "tt0910970",  # WALL·E
    "tt2380307",  # Coco
    "tt4633694",  # Spider-Man: Into the Spider-Verse
    "tt0241527",  # Harry Potter and the Sorcerer's Stone
    "tt1201607",  # Harry Potter and the Deathly Hallows: Part 2
    "tt0086190",  # Return of the Jedi
    "tt10872600",  # Spider-Man: No Way Home
    "tt1877830",  # The Batman
    "tt1517268",  # Barbie
    "tt2096673",  # Inside Out
    "tt1630029",  # Avatar: The Way of Water
)

FALLBACK_IMDB_IDS = (
    "tt0112641",  # Casino
    "tt0078788",  # Apocalypse Now
    "tt0057012",  # Dr. Strangelove
    "tt0086250",  # Scarface
    "tt0105236",  # Reservoir Dogs
    "tt0266543",  # Finding Nemo
    "tt0198781",  # Monsters, Inc.
    "tt2278388",  # The Grand Budapest Hotel
    "tt1895587",  # Spotlight
    "tt2024544",  # 12 Years a Slave
    "tt0118715",  # The Big Lebowski
    "tt0095016",  # Die Hard
    "tt0372784",  # Batman Begins
    "tt2267998",  # Gone Girl
    "tt0457430",  # Pan's Labyrinth
    "tt0325980",  # Pirates of the Caribbean: The Curse of the Black Pearl
    "tt0113277",  # Heat
    "tt0266697",  # Kill Bill: Vol. 1
    "tt0047396",  # Rear Window
    "tt0112573",  # Braveheart
    "tt1345836",  # The Dark Knight Rises
    "tt0169547",  # American Beauty
    "tt0119488",  # L.A. Confidential
    "tt2106476",  # The Hunt
    "tt0382932",  # Ratatouille
    "tt0268978",  # A Beautiful Mind
    "tt0120382",  # The Truman Show
    "tt0338013",  # Eternal Sunshine of the Spotless Mind
    "tt0405159",  # Million Dollar Baby
)


def _get_or_create_user(db: Session, email: str, role: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(
        email=email,
        hashed_password=hash_password(SEED_PASSWORD),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Seeded user %s (%s)", email, role)
    return user


def _admin_title_count(db: Session, admin_id: int) -> int:
    return db.query(AdminMovie).filter(AdminMovie.user_id == admin_id).count()


def _imdb_ids_owned_by(db: Session, admin_id: int) -> set[str]:
    return {
        imdb_id
        for (imdb_id,) in db.query(Movie.imdb_id)
        .join(AdminMovie, AdminMovie.movie_id == Movie.id)
        .filter(AdminMovie.user_id == admin_id)
    }


def _fetch_and_store_movie(db: Session, imdb_id: str) -> Movie | None:
    movie = db.query(Movie).filter(Movie.imdb_id == imdb_id).first()
    if movie:
        if movie.embedding is None:
            movie.embedding = embedding_service.embed_movie(movie.title, movie.genre, movie.plot)
            db.commit()
        return movie

    try:
        data = omdb_service.get_movie_details(imdb_id=imdb_id)
        details = MovieDetail.model_validate(data)
    except HTTPException:
        logger.exception("OMDb could not fetch %s", imdb_id)
        return None
    except Exception:
        logger.exception("Failed to store OMDb title %s", imdb_id)
        return None

    movie = Movie(
        imdb_id=details.imdb_id,
        title=details.title,
        year=details.year,
        poster=details.poster,
        type=details.type,
        genre=details.genre,
        plot=details.plot,
        imdb_rating=details.imdb_rating,
        embedding=embedding_service.embed_movie(details.title, details.genre, details.plot),
    )
    db.add(movie)
    db.commit()
    db.refresh(movie)
    return movie


def _link_admin_movie(db: Session, admin: User, movie: Movie) -> None:
    already = (
        db.query(AdminMovie)
        .filter(AdminMovie.user_id == admin.id, AdminMovie.movie_id == movie.id)
        .first()
    )
    if already:
        return
    db.add(AdminMovie(user_id=admin.id, movie_id=movie.id))
    db.commit()


def _seed_admin_catalog(db: Session, admin: User, primary_ids: tuple[str, ...]) -> None:
    fallback_index = 0
    reserved = set(ADMIN1_IMDB_IDS) | set(ADMIN2_IMDB_IDS)

    for imdb_id in primary_ids:
        if _admin_title_count(db, admin.id) >= TITLES_PER_ADMIN:
            return

        movie = _fetch_and_store_movie(db, imdb_id)
        if movie is None:
            while fallback_index < len(FALLBACK_IMDB_IDS):
                fallback_id = FALLBACK_IMDB_IDS[fallback_index]
                fallback_index += 1
                if fallback_id in reserved or fallback_id in _imdb_ids_owned_by(db, admin.id):
                    continue
                movie = _fetch_and_store_movie(db, fallback_id)
                if movie is not None:
                    reserved.add(movie.imdb_id)
                    break
            if movie is None:
                continue

        reserved.add(movie.imdb_id)
        _link_admin_movie(db, admin, movie)
        logger.info(
            "Seeded %s for %s (%s/%s)",
            movie.title,
            admin.email,
            _admin_title_count(db, admin.id),
            TITLES_PER_ADMIN,
        )


def seed_database() -> None:
    db = SessionLocal()
    try:
        admins: list[User] = []
        for email, role in SEED_USERS:
            user = _get_or_create_user(db, email, role)
            if role == ADMIN:
                admins.append(user)

        if len(admins) < 2:
            logger.error("Seed needs at least two admin accounts")
            return

        admin1, admin2 = admins[0], admins[1]

        if (
            _admin_title_count(db, admin1.id) >= TITLES_PER_ADMIN
            and _admin_title_count(db, admin2.id) >= TITLES_PER_ADMIN
        ):
            logger.info("Database seed already complete, skipping")
            return

        logger.info("Seeding catalog titles via OMDb (this can take a while on first run)")
        _seed_admin_catalog(db, admin1, ADMIN1_IMDB_IDS)
        _seed_admin_catalog(db, admin2, ADMIN2_IMDB_IDS)
        logger.info(
            "Seed finished: admin1=%s titles, admin2=%s titles",
            _admin_title_count(db, admin1.id),
            _admin_title_count(db, admin2.id),
        )
    finally:
        db.close()
