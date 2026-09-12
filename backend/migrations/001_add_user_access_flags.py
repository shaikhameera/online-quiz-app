"""Add access flags to users created before access control was introduced."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import users_collection


def migrate():
    users_collection.update_many(
        {"can_take_test": {"$exists": False}},
        {"$set": {"can_take_test": True}}
    )
    users_collection.update_many(
        {"can_retake_test": {"$exists": False}},
        {"$set": {"can_retake_test": True}}
    )
    users_collection.update_many(
        {"is_first_login": {"$exists": False}},
        {"$set": {"is_first_login": False}}
    )


if __name__ == "__main__":
    migrate()
