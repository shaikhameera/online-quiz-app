import importlib.util
import sys
import types
import unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import MagicMock, patch

from bson import ObjectId
from fastapi import HTTPException
from starlette.requests import Request


class QuizHistoryTests(unittest.TestCase):
    def setUp(self):
        database = types.ModuleType("app.database")
        self.database = database
        database.questions_collection = MagicMock()
        database.results_collection = MagicMock()
        database.users_collection = MagicMock()
        database.users_collection.find_one.return_value = {
            "email": "first@example.com", "name": "First", "role": "user",
            "can_take_test": True, "can_retake_test": True, "is_first_login": False,
        }
        database.users_collection = MagicMock()
        database.users_collection.find_one.return_value = {
            "email": "first@example.com", "name": "First", "role": "user",
            "can_take_test": True, "can_retake_test": True, "is_first_login": False,
        }
        self.results = database.results_collection
        spec = importlib.util.spec_from_file_location(
            "quiz_history_under_test", Path(__file__).parents[1] / "routes" / "quiz.py"
        )
        self.quiz = importlib.util.module_from_spec(spec)
        with patch.dict(sys.modules, {"app.database": database}):
            spec.loader.exec_module(self.quiz)

    def test_requires_login(self):
        with self.assertRaises(HTTPException) as raised:
            self.quiz.get_history(Request({"type": "http", "session": {}}))
        self.assertEqual(raised.exception.status_code, 401)
        self.results.find.assert_not_called()

    def test_filters_by_session_and_returns_only_summary(self):
        result_id = ObjectId()
        self.results.find.return_value.sort.return_value = [{
            "_id": result_id, "score": 2, "total_questions": 4,
            "percentage": 50, "submitted_at": datetime(2026, 9, 5, 12),
            "answers": [{"correct_answer": "private"}], "user_email": "first@example.com"
        }]
        request = Request({"type": "http", "session": {"user": {"email": "first@example.com"}},
                           "query_string": b"user_email=other@example.com"})
        history = self.quiz.get_history(request)
        self.assertEqual(self.results.find.call_args.args[0], {"user_email": "first@example.com"})
        self.results.find.return_value.sort.assert_called_once_with([("submitted_at", -1), ("_id", -1)])
        self.assertEqual(history, [{"result_id": str(result_id), "quiz_name": "General Quiz", "score": 2,
                                   "total_questions": 4, "percentage": 50,
                                   "submitted_at": "2026-09-05T12:00:00+00:00"}])

    def test_no_attempts_returns_empty_list(self):
        self.results.find.return_value.sort.return_value = []
        request = Request({"type": "http", "session": {"user": {"email": "new@example.com"}}})
        self.assertEqual(self.quiz.get_history(request), [])

    def test_first_login_cannot_read_history(self):
        self.database.users_collection.find_one.return_value["is_first_login"] = True
        request = Request({"type": "http", "session": {"user": {"email": "first@example.com"}}})
        with self.assertRaises(HTTPException) as error:
            self.quiz.get_history(request)
        self.assertEqual(error.exception.status_code, 403)
        self.results.find.assert_not_called()


if __name__ == "__main__":
    unittest.main()
