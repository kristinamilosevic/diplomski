from sqlalchemy import text

from app.database import engine


def migrate() -> None:
    stmt = text(
        """
        ALTER TABLE movies
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
        """
    )
    with engine.begin() as conn:
        conn.execute(stmt)
    print("Migration OK: movies.created_at column is present.")


if __name__ == "__main__":
    migrate()
