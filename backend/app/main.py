from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, movies

app = FastAPI(title="Diplomski API")

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

@app.get("/")
async def root():
    return {"message": "Diplomski API is running"}

