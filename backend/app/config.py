import os

from dotenv import load_dotenv

load_dotenv()

OMDB_API_KEY = os.getenv("OMDB_API_KEY")
OMDB_BASE_URL = os.getenv("OMDB_BASE_URL", "https://www.omdbapi.com/")
