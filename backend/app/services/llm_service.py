import json
import logging
import re

import requests
from fastapi import HTTPException, status

from app.config import GEMINI_API_KEY, GEMINI_BASE_URL, GEMINI_MODEL
from app.schemas.movie import ChatMessage, ChatRecommendFilters

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are helping a movie and TV catalog assistant.

Read the conversation and turn the user's request into search filters for the catalog.
Return only a valid JSON object using the fields below:

{
  "limit": integer 1-10,
  "genres": string[],
  "exclude_genres": string[],
  "type": "movie" | "series" | null,
  "min_rating": number | null,
  "year_from": integer | null,
  "year_to": integer | null,
  "sort": "rating_desc" | "year_desc" | "year_asc" | "relevance",
  "semantic_query": string | null
}

Use these guidelines:

- Keep the default limit at 5 unless the user asks for a different number.
- Use rating_desc for requests such as "best", "highest-rated", or "highly rated".
- Use year_desc for "newest", "latest", or "newer" and year_asc for "oldest".
- For a decade such as the 2010s, use year_from=2010 and year_to=2019.
- For requests such as "above 8" or "rated over 8", use min_rating=8.
- Use movie for movies and series for TV shows or series.
- Put genres the user wants in genres.
- Put genres the user does not want in exclude_genres.
- For example, "sci-fi movies but not animated" means genres=["Sci-Fi"] and exclude_genres=["Animation"].
- Treat "cartoons", "animated", and "animation" as the Animation genre when they are used as a genre or exclusion.
- Use OMDb-style genre names when possible, such as Action, Comedy, Drama, Romance, Sci-Fi, Thriller, Animation, Crime, Adventure, Fantasy, Horror, Mystery, War, and Biography.
- Use semantic_query for descriptions of a movie's story, theme, mood, or meaning, such as "about dreams and subconscious mind" or "emotional movies about complicated relationships".
- Do not invent movie titles or information about movies. The actual movies will be selected from the catalog.
- When the user sends a follow-up request, keep the previous filters and change only what the user asked to change.
- If the request only describes a theme, mood, or plot, use sort=relevance. Otherwise, use rating_desc by default.
""".strip()

FILTER_RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "limit": {"type": "INTEGER"},
        "genres": {"type": "ARRAY", "items": {"type": "STRING"}},
        "exclude_genres": {"type": "ARRAY", "items": {"type": "STRING"}},
        "type": {"type": "STRING", "nullable": True},
        "min_rating": {"type": "NUMBER", "nullable": True},
        "year_from": {"type": "INTEGER", "nullable": True},
        "year_to": {"type": "INTEGER", "nullable": True},
        "sort": {
            "type": "STRING",
            "enum": ["rating_desc", "year_desc", "year_asc", "relevance"],
        },
        "semantic_query": {"type": "STRING", "nullable": True},
    },
    "required": ["limit", "genres", "exclude_genres", "sort"],
}


def _gemini_contents(messages: list[ChatMessage]) -> list[dict]:
    contents: list[dict] = []
    for message in messages:
        text = message.content.strip()
        if not text:
            continue
        role = "model" if message.role == "assistant" else "user"
        if contents and contents[-1]["role"] == role:
            contents[-1]["parts"][0]["text"] += f"\n{text}"
        else:
            contents.append({"role": role, "parts": [{"text": text}]})
    if contents and contents[0]["role"] != "user":
        contents.insert(0, {"role": "user", "parts": [{"text": "Recommend movies."}]})
    return contents


def _parse_model_json(content: str) -> dict:
    stripped = content.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)\s*```", stripped, re.DOTALL)
    if fenced:
        stripped = fenced.group(1).strip()
    return json.loads(stripped)


def parse_recommend_filters(messages: list[ChatMessage]) -> ChatRecommendFilters:
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chat recommendations are not configured",
        )

    payload = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": _gemini_contents(messages),
        "generationConfig": {
            "temperature": 0,
            "responseMimeType": "application/json",
            "responseSchema": FILTER_RESPONSE_SCHEMA,
        },
    }

    try:
        response = requests.post(
            f"{GEMINI_BASE_URL.rstrip('/')}/models/{GEMINI_MODEL}:generateContent",
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            json=payload,
            timeout=30,
        )
        if response.status_code == 429:
            logger.warning("Gemini rate limited: %s", response.text)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="The recommendation service is busy. Try again in a minute.",
            )
        if not response.ok:
            logger.warning("Gemini HTTP %s: %s", response.status_code, response.text)
        response.raise_for_status()
        parts = response.json()["candidates"][0]["content"]["parts"]
        content = "".join(part.get("text", "") for part in parts)
        data = _parse_model_json(content)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("LLM filter extraction failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not interpret the recommendation request",
        ) from exc

    try:
        return ChatRecommendFilters.model_validate(data)
    except Exception as exc:
        logger.warning("Gemini returned invalid filters: %s", data)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not interpret the recommendation request",
        ) from exc
