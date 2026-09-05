import importlib.util
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch
from bson import ObjectId
from fastapi import HTTPException
from pydantic import ValidationError
from starlette.requests import Request
from app.models.batch import BatchConfig
from app.models.quiz import QuizSubmission

class BatchTests(unittest.TestCase):
    def setUp(self):
        self.db = types.ModuleType("app.database")
        for name in ["questions_collection", "results_collection", "quiz_attempts_collection", "quiz_settings_collection"]:
            setattr(self.db, name, MagicMock())
        self.modules = patch.dict(sys.modules, {"app.database": self.db})
        self.modules.start()
        self.addCleanup(self.modules.stop)
        spec = importlib.util.spec_from_file_location("batch_test_routes", Path(__file__).parents[1] / "routes" / "quiz.py")
        self.routes = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.routes)
        self.request = Request({"type": "http", "session": {"user": {"email": "a@example.com", "name": "A"}}})
        self.config = {"quiz_name": "Term One", "duration_seconds": 120, "subjects": [{"name": "English"}]}
        self.db.quiz_settings_collection.find_one.return_value = self.config
        self.question = {"_id": ObjectId(), "question": "Q", "options": ["A", "B"], "correct_answer": "A", "subject": "English"}
        self.db.questions_collection.find.return_value.sort.return_value = [self.question]
        self.db.quiz_attempts_collection.insert_one.return_value.inserted_id = ObjectId()

    def test_start_selects_subject_and_hides_answers(self):
        result = self.routes.start_batch(self.request)
        self.assertEqual(result["quiz_name"], "Term One")
        self.assertEqual(result["duration_seconds"], 120)
        self.db.questions_collection.find.assert_called_once_with({"subject": "English"})
        self.assertNotIn("correct_answer", result["questions"][0])
        self.assertEqual(len(result["questions"]), 1)

    def test_all_questions_selected_despite_legacy_count(self):
        self.db.quiz_settings_collection.find_one.return_value = {**self.config, "subjects": [{"name": "English", "question_count": 1}]}
        second = {**self.question, "_id": ObjectId()}
        self.db.questions_collection.find.return_value.sort.return_value = [self.question, second]
        result = self.routes.start_batch(self.request)
        self.assertEqual(len(result["questions"]), 2)
        from app.utils.batch import get_config
        self.assertEqual(get_config()["subjects"], [{"name": "English"}])

    def test_empty_subject(self):
        self.db.questions_collection.find.return_value.sort.return_value = []
        with self.assertRaises(HTTPException) as error:
            self.routes.start_batch(self.request)
        self.assertEqual(error.exception.status_code, 400)
        self.db.quiz_attempts_collection.insert_one.assert_not_called()

    def test_duration_fallback(self):
        self.db.quiz_settings_collection.find_one.return_value = {**self.config, "duration_seconds": -1}
        result = self.routes.start_batch(self.request)
        self.assertIsNone(result["duration_seconds"])
        self.assertEqual(self.db.quiz_attempts_collection.insert_one.call_args.args[0]["duration_seconds"], 60)

    def test_configuration_validation(self):
        for changes in [{"duration_seconds": 0}, {"subjects": []}, {"subjects": self.config["subjects"] * 5}, {"subjects": self.config["subjects"] * 2}, {"quiz_name": "  "}]:
            with self.assertRaises(ValidationError):
                BatchConfig(**{**self.config, **changes})

    def test_grade_snapshot_and_scope_owner(self):
        attempt_id = ObjectId()
        question_id = str(self.question["_id"])
        self.db.quiz_attempts_collection.find_one.return_value = {"quiz_name": "Original Name", "duration_seconds": 120,
            "questions": [{**self.question, "id": question_id}]}
        saved = {"_id": attempt_id, "quiz_name": "Original Name", "score": 1, "total_questions": 1, "percentage": 100}
        self.db.results_collection.find_one.side_effect = [None, saved]
        result = self.routes.submit_batch(QuizSubmission(attempt_id=str(attempt_id), answers=[{"question_id": question_id, "selected_answer": "A"}]), {"email": "a@example.com", "name": "A"})
        self.assertEqual(result["quiz_name"], "Original Name")
        self.assertEqual(result["total_questions"], 1)
        self.db.quiz_attempts_collection.find_one.assert_called_once_with({"_id": attempt_id, "user_email": "a@example.com"})
        stored = self.db.results_collection.update_one.call_args.args[1]["$setOnInsert"]
        self.assertEqual(stored["score"], 1)
        self.assertEqual(stored["total_questions"], 1)

    def test_custom_subject_names(self):
        from app.models.question import QuestionCreate
        from app.utils.batch import get_config
        config = BatchConfig(**{**self.config, "subjects": [{"name": "  Computer Science  "}]})
        self.assertEqual(config.subjects[0].name, "Computer Science")
        question = QuestionCreate(question="Q", options=["A", "B"], correct_answer="A", subject=" Computer Science ")
        self.assertEqual(question.subject, "Computer Science")
        self.db.quiz_settings_collection.find_one.return_value = config.model_dump()
        self.assertEqual(get_config()["available_subjects"], ["Computer Science"])
        self.db.quiz_settings_collection.find_one.return_value = None
        self.assertEqual(get_config()["available_subjects"], [])

    def test_rejects_blank_long_and_duplicate_subject_names(self):
        for subjects in [
            [{"name": "  "}],
            [{"name": "x" * 101}],
            [{"name": "Physics"}, {"name": " physics "}],
        ]:
            with self.assertRaises(ValidationError):
                BatchConfig(**{**self.config, "subjects": subjects})

    def test_legacy_start(self):
        self.db.quiz_settings_collection.find_one.return_value = None
        self.db.questions_collection.find.return_value.sort.return_value = [self.question]
        result = self.routes.start_batch(self.request)
        self.assertEqual(result["quiz_name"], "General Quiz")
        self.assertEqual(len(result["questions"]), 1)

if __name__ == "__main__":
    unittest.main()
