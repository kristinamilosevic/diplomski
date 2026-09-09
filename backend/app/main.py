from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import Base, engine
from app.models.admin_movie import AdminMovie
from app.models.movie import Movie
from app.models.user import User
from app.models.watchlist import UserWatchlist
from app.routers import auth, movies, watchlist
from app.seed import seed_database

_MODELS = (User, Movie, AdminMovie, UserWatchlist)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE movies ADD COLUMN IF NOT EXISTS embedding vector(768)"))
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS movies_embedding_idx "
                "ON movies USING hnsw (embedding vector_cosine_ops)"
            )
        )
    try:
        seed_database()
    except Exception:
        logging.getLogger(__name__).exception("Database seed failed")
    yield


app = FastAPI(title="Diplomski API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(watchlist.router)

@app.get("/")
async def root():
    return {"message": "Diplomski API is running"}

