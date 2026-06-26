from fastapi import APIRouter, Depends
from app.database import (
    users_collection,
    questions_collection,
    results_collection
)
from app.utils.admin import admin_required
from app.models.question import QuestionCreate
from bson import ObjectId
from fastapi import HTTPException

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(admin_required)]
)

@router.get("/users")
def get_all_users():

    users = []

    for user in users_collection.find():

        users.append({
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        })

    return users

@router.post("/questions")
def add_question(question: QuestionCreate):

    result = questions_collection.insert_one({
        "question": question.question,
        "options": question.options,
        "correct_answer": question.correct_answer
    })

    return {
        "message": "Question Added",
        "id": str(result.inserted_id)
    }

@router.get("/questions")
def get_all_questions():

    questions = []

    for q in questions_collection.find():

        questions.append({
            "id": str(q["_id"]),
            "question": q["question"],
            "options": q["options"],
            "correct_answer": q["correct_answer"]
        })

    return questions

@router.put("/questions/{question_id}")
def update_question(
    question_id: str,
    question: QuestionCreate
):

    try:
        obj_id = ObjectId(question_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid Question ID"
        )

    result = questions_collection.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "question": question.question,
                "options": question.options,
                "correct_answer": question.correct_answer
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    return {
        "message": "Question updated"
    }

@router.delete("/questions/{question_id}")
def delete_question(question_id: str):

    try:
        obj_id = ObjectId(question_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid Question ID"
        )

    result = questions_collection.delete_one(
        {"_id": obj_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    return {
        "message": "Question deleted"
    }

@router.get("/results")
def get_results():

    results = []

    for result in results_collection.find():

        result["_id"] = str(result["_id"])

        results.append(result)

    return results

@router.get("/stats")
def get_stats():

    return {
        "total_users": users_collection.count_documents({}),
        "total_questions": questions_collection.count_documents({}),
        "total_results": results_collection.count_documents({})
    }
