from fastapi import APIRouter, Request, HTTPException
from bson import ObjectId
from datetime import datetime

from app.database import (
    questions_collection,
    results_collection
)

from app.models.quiz import QuizSubmission

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)

@router.post("/submit")
def submit_quiz(
    submission: QuizSubmission,
    request: Request
):

    user = request.session.get("user")

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Login Required"
        )

    score = 0

    result_answers = []

    for answer in submission.answers:

        question = questions_collection.find_one(
            {
                "_id": ObjectId(answer.question_id)
            }
        )

        if not question:
            continue

        is_correct = (
            answer.selected_answer
            == question["correct_answer"]
        )

        if is_correct:
            score += 1

        result_answers.append({
            "question_id": answer.question_id,
            "selected_answer": answer.selected_answer,
            "correct_answer": question["correct_answer"],
            "is_correct": is_correct
        })

    total_questions = len(submission.answers)

    percentage = (
        score / total_questions * 100
        if total_questions > 0
        else 0
    )

    result = {
        "user_email": user["email"],
        "user_name": user["name"],
        "score": score,
        "total_questions": total_questions,
        "percentage": round(
            percentage,
            2
        ),
        "submitted_at": datetime.utcnow(),
        "answers": result_answers
    }

    inserted = results_collection.insert_one(
        result
    )

    return {
        "message": "Quiz Submitted",
        "result_id": str(
            inserted.inserted_id
        ),
        "score": score,
        "total_questions": total_questions,
        "percentage": round(
            percentage,
            2
        )
    }
