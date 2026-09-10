# Watchlist

A movie and TV catalog with personal watchlists and AI-powered recommendations.

The application supports two roles:

* **Admin** — adds movies and TV shows to the shared catalog using OMDb.
* **User** — browses the catalog, manages a personal watchlist, and gets recommendations.

The UI is available in **English and Serbian**.

## Features

* Browse and search movies and TV shows
* Filter and sort the catalog by different criteria
* Add movies/TV shows to your personal watchlist
* Track your watchlist status, ratings, and notes
* **Similar** — get movie recommendations based on semantic similarity using EmbeddingGemma
* **Assistant** — get personalized recommendations through a chat interface powered by Gemini, using only stored movies and TV shows


## Tech Stack

* React + TypeScript
* FastAPI + SQLAlchemy
* PostgreSQL + pgvector
* OMDb API
* EmbeddingGemma
* Gemini API

## Requirements

* Docker and Docker Compose
* OMDb API key
* Gemini API key 

## Configuration

Create `backend/.env`:

```env
OMDB_API_KEY=your_omdb_key
GEMINI_API_KEY=your_gemini_key
```

Optional:

```env
GEMINI_MODEL=gemini-3.5-flash
SECRET_KEY=change-this-in-production
```

Get your API keys from:

* OMDb: https://www.omdbapi.com/apikey.aspx
* Gemini: https://aistudio.google.com/apikey

## Running the Application

From the project root:

```bash
docker compose up --build
```

Start the frontend in a separate terminal:

```bash
cd frontend
npm install
npm start
```

Open:

**http://localhost:3000**

The backend is available at **http://localhost:8000**

On the first start, the application automatically creates demo accounts and populates the catalog. EmbeddingGemma is also downloaded, so the first startup may take a few minutes.

## Demo Accounts

All demo accounts use the password:

**`Password123`**

| Email              | Role  |
| ------------------ | ----- |
| `admin1@gmail.com` | Admin |
| `admin2@gmail.com` | Admin |
| `ana@gmail.com`    | User  |
| `pera@gmail.com`   | User  |
| `sara@gmail.com`   | User  |

You can also create a new account through the registration page.

## Stopping the Application

```bash
docker compose down
```

Use `docker compose down -v` only if you want to remove the database data as well.
