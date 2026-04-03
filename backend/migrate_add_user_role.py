from sqlalchemy import text

from app.database import engine


def migrate() -> None:
    stmt = text(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';
        """
    )
    with engine.begin() as conn:
        conn.execute(stmt)
    print("Migration OK: users.role column is present.")


if __name__ == "__main__":
    migrate()
