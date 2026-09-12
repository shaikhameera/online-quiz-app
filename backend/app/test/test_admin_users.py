import importlib
import sys
import types
import unittest
from unittest.mock import MagicMock, patch

from bson import ObjectId
from fastapi import HTTPException
from starlette.requests import Request


class DeleteUserTests(unittest.TestCase):
    def setUp(self):
        database = types.ModuleType("app.database")
        database.users_collection = MagicMock()
        database.questions_collection = MagicMock()
        database.results_collection = MagicMock()
        self.modules = patch.dict(sys.modules, {"app.database": database})
        self.modules.start()
        self.addCleanup(self.modules.stop)
        self.admin = importlib.import_module("app.routes.admin")
        self.collection = MagicMock()
        self.collection_patch = patch.object(self.admin, "users_collection", self.collection)
        self.collection_patch.start()
        self.addCleanup(self.collection_patch.stop)
        self.user_id = ObjectId()

    def assert_status(self, status, callback):
        with self.assertRaises(HTTPException) as raised:
            callback()
        self.assertEqual(raised.exception.status_code, status)

    def test_removes_regular_user_only(self):
        self.collection.find_one.return_value = {"role": "user"}
        self.collection.delete_one.return_value.deleted_count = 1
        self.assertEqual(self.admin.delete_user(str(self.user_id)), {"message": "User removed"})
        self.collection.delete_one.assert_called_once_with(
            {"_id": self.user_id, "role": {"$ne": "admin"}}
        )

    def test_rejects_invalid_id(self):
        self.assert_status(400, lambda: self.admin.delete_user("invalid"))
        self.collection.delete_one.assert_not_called()

    def test_missing_user(self):
        self.collection.find_one.return_value = None
        self.assert_status(404, lambda: self.admin.delete_user(str(self.user_id)))
        self.collection.delete_one.assert_not_called()

    def test_protects_administrators(self):
        self.collection.find_one.return_value = {"role": "admin"}
        self.assert_status(403, lambda: self.admin.delete_user(str(self.user_id)))
        self.collection.delete_one.assert_not_called()

    def test_concurrent_change_is_not_reported_as_success(self):
        self.collection.find_one.return_value = {"role": "user"}
        self.collection.delete_one.return_value.deleted_count = 0
        self.assert_status(409, lambda: self.admin.delete_user(str(self.user_id)))

    def test_route_requires_admin(self):
        route = next(route for route in self.admin.router.routes if route.path == "/admin/users/{user_id}")
        self.assertIn(self.admin.admin_required, [dependency.dependency for dependency in route.dependencies])
        database_users = sys.modules["app.database"].users_collection
        database_users.find_one.return_value = {
            "email": "user@example.com", "role": "user", "is_first_login": False,
        }
        for session, status in [({}, 401), ({"user": {"email": "user@example.com", "role": "user"}}, 403)]:
            request = Request({"type": "http", "session": session})
            self.assert_status(status, lambda: self.admin.admin_required(request))

    def test_admin_created_user_has_default_password_flow_and_no_test_access(self):
        self.collection.find_one.return_value = None
        self.collection.insert_one.return_value.inserted_id = self.user_id
        with patch.object(self.admin, "hash_password", return_value="hashed"):
            created = self.admin.create_user(self.admin.AdminUserCreate(
                name="Student", email="student@example.com", password="password123"
            ))
        self.assertFalse(created["can_take_test"])
        self.assertFalse(created["can_retake_test"])
        self.assertTrue(created["is_first_login"])
        stored = self.collection.insert_one.call_args.args[0]
        self.assertEqual(stored["password"], "hashed")

    def test_updates_initial_and_retake_access_independently(self):
        self.collection.update_one.return_value.matched_count = 1
        result = self.admin.update_user_access(
            str(self.user_id),
            self.admin.UserAccessUpdate(can_take_test=True, can_retake_test=False)
        )
        self.assertTrue(result["can_take_test"])
        self.assertFalse(result["can_retake_test"])
        self.collection.update_one.assert_called_once_with(
            {"_id": self.user_id, "role": {"$ne": "admin"}},
            {"$set": {"can_take_test": True, "can_retake_test": False}}
        )


if __name__ == "__main__":
    unittest.main()
