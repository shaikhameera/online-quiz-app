from pydantic import BaseModel
from typing import List

class QuestionCreate(BaseModel):
    question: str
    options: List[str]
    correct_answer: str