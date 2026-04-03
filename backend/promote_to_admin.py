import argparse
import sys

from app.database import SessionLocal
from app.models.role import ADMIN
from app.models.user import User


def main() -> None:
    parser = argparse.ArgumentParser(description="Set a user's role to admin.")
    parser.add_argument("email", help="User email")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == args.email).first()
        if not user:
            print(f"No user with email: {args.email}", file=sys.stderr)
            sys.exit(1)
        user.role = ADMIN
        db.commit()
        print(f"OK: {args.email} is now an admin.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
