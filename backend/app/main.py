from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.admin_movie import AdminMovie
from app.models.movie import Movie
from app.models.user import User
from app.models.watchlist import UserWatchlist
from app.routers import auth, movies, watchlist

_MODELS = (User, Movie, AdminMovie, UserWatchlist)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
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

