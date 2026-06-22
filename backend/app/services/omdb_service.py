import logging

import requests
from fastapi import HTTPException, status

from app.config import OMDB_API_KEY, OMDB_BASE_URL

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT = 10


class OMDbService:
    def __init__(self) -> None:
        if not OMDB_API_KEY:
            raise RuntimeError("OMDB_API_KEY environment variable is not set")

    def _get(self, params: dict) -> dict:
        try:
            response = requests.get(
                OMDB_BASE_URL,
                params={**params, "apikey": OMDB_API_KEY},
                timeout=REQUEST_TIMEOUT,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            logger.exception("OMDb API request failed")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to reach OMDb API",
            ) from exc

        data = response.json()
        if data.get("Response") == "False":
            error_message = data.get("Error", "Movie not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_message,
            )

        return data

    def search_movies(self, query: str, page: int = 1) -> dict:
        return self._get({"s": query.strip(), "page": page})

    def get_movie_details(self, imdb_id: str) -> dict:
        return self._get({"i": imdb_id.strip(), "plot": "full"})


omdb_service = OMDbService()
