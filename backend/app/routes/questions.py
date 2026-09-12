from fastapi import APIRouter, Request
from app.database import questions_collection, users_collection
from app.utils.user_access import current_database_user

router = APIRouter(
    prefix="/quiz",
    tags=["Questions"]
)

@router.get("/questions")
def get_quiz_questions(request: Request):
    current_database_user(request, users_collection)

    questions = []

    for q in questions_collection.find():

        questions.append({
            "id": str(q["_id"]),
            "question": q["question"],
            "options": q["options"]
        })

    return questions
