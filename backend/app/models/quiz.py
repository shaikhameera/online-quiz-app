from pydantic import BaseModel
from typing import List


class QuizAnswer(BaseModel):
    question_id: str
    selected_answer: str


class QuizSubmission(BaseModel):
    answers: List[QuizAnswer]

    attempt_id: str | None = None
