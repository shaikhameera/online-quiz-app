from fastapi import APIRouter
from app.database import questions_collection

router = APIRouter(
    prefix="/quiz",
    tags=["Questions"]
)

@router.get("/questions")
def get_quiz_questions():

    questions = []

    for q in questions_collection.find():

        questions.append({
            "id": str(q["_id"]),
            "question": q["question"],
            "options": q["options"]
        })

    return questions
