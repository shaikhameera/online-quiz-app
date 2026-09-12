import importlib.util
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

from bson import ObjectId
from fastapi import HTTPException
from starlette.requests import Request


class UserProfileTests(unittest.TestCase):
    def setUp(self):
        database = types.ModuleType("app.database")
        database.users_collection = MagicMock()
        self.users = database.users_collection
        spec = importlib.util.spec_from_file_location(
            "user_profile_under_test", Path(__file__).parents[1] / "routes" / "user.py"
        )
        self.user_routes = importlib.util.module_from_spec(spec)
        with patch.dict(sys.modules, {"app.database": database}):
            spec.loader.exec_module(self.user_routes)
        self.user_id = ObjectId()
        self.user = {
            "_id": self.user_id,
            "name": "Student",
            "email": "student@example.com",
            "password": "old-hash",
            "role": "user",
            "can_take_test": False,
            "can_retake_test": True,
            "is_first_login": True,
        }
        self.users.find_one.return_value = self.user
        self.request = Request({
            "type": "http",
            "session": {"user": {"email": "student@example.com", "role": "user"}},
        })

    def test_profile_is_read_only_and_returns_access_state(self):
        profile = self.user_routes.get_me(self.request)
        self.assertEqual(profile["name"], "Student")
        self.assertEqual(profile["email"], "student@example.com")
        self.assertTrue(profile["is_first_login"])
        self.assertNotIn("password", profile)

    def test_password_change_finishes_first_login(self):
        self.users.update_one.return_value.matched_count = 1
        passwords = self.user_routes.PasswordChange(
            current_password="default-password",
            new_password="new-password-123",
        )
        with patch.object(self.user_routes, "verify_password", side_effect=[True, False]), \
             patch.object(self.user_routes, "hash_password", return_value="new-hash"):
            result = self.user_routes.change_password(passwords, self.request)
        self.assertEqual(result["message"], "Password changed successfully")
        self.users.update_one.assert_called_once_with(
            {"_id": self.user_id},
            {"$set": {"password": "new-hash", "is_first_login": False}}
        )

    def test_wrong_current_password_is_rejected(self):
        passwords = self.user_routes.PasswordChange(
            current_password="wrong-password",
            new_password="new-password-123",
        )
        with patch.object(self.user_routes, "verify_password", return_value=False):
            with self.assertRaises(HTTPException) as error:
                self.user_routes.change_password(passwords, self.request)
        self.assertEqual(error.exception.status_code, 400)
        self.users.update_one.assert_not_called()

    def test_public_registration_still_requires_admin_test_access(self):
        self.users.find_one.return_value = None
        with patch.object(self.user_routes, "hash_password", return_value="hash"):
            self.user_routes.register(self.user_routes.UserRegister(
                name="Self Registered", email="self@example.com", password="password123"
            ))
        stored = self.users.insert_one.call_args.args[0]
        self.assertFalse(stored["can_take_test"])
        self.assertFalse(stored["can_retake_test"])
        self.assertFalse(stored["is_first_login"])


if __name__ == "__main__":
    unittest.main()
