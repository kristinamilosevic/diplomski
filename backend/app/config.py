import os

from dotenv import load_dotenv

load_dotenv()

OMDB_API_KEY = os.getenv("OMDB_API_KEY")
OMDB_BASE_URL = os.getenv("OMDB_BASE_URL", "https://www.omdbapi.com/")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_BASE_URL = os.getenv(
    "GEMINI_BASE_URL",
    "https://generativelanguage.googleapis.com/v1beta",
)
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
