from pydantic import BaseModel, field_validator
from typing import List

class QuestionCreate(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    subject: str | None = None

    @field_validator("subject")
    @classmethod
    def valid_subject(cls, value):
        if value is None:
            return None
        value = value.strip()
        if not value or len(value) > 100:
            raise ValueError("Subject name must contain 1-100 characters")
        return value
