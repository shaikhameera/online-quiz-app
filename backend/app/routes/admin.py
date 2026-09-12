from fastapi import APIRouter, Depends
from app.database import (
    users_collection,
    questions_collection,
    results_collection
)
from app.utils.admin import admin_required
from app.models.question import QuestionCreate
from app.models.user import AdminUserCreate, UserAccessUpdate
from app.utils.security import hash_password
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
            "role": user["role"],
            "can_take_test": user.get("can_take_test", True),
            "can_retake_test": user.get("can_retake_test", True),
            "is_first_login": user.get("is_first_login", False)
        })

    return users


@router.post("/users", status_code=201)
def create_user(user: AdminUserCreate):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=409, detail="Email already exists")

    result = users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": "user",
        "can_take_test": False,
        "can_retake_test": False,
        "is_first_login": True
    })
    return {
        "id": str(result.inserted_id),
        "name": user.name,
        "email": user.email,
        "role": "user",
        "can_take_test": False,
        "can_retake_test": False,
        "is_first_login": True
    }


@router.patch("/users/{user_id}/access")
def update_user_access(user_id: str, access: UserAccessUpdate):
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid User ID")

    result = users_collection.update_one(
        {"_id": obj_id, "role": {"$ne": "admin"}},
        {"$set": access.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Test access updated", **access.model_dump()}

@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid User ID")

    user = users_collection.find_one({"_id": obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Administrator accounts cannot be removed")

    result = users_collection.delete_one({"_id": obj_id, "role": {"$ne": "admin"}})
    if result.deleted_count == 0:
        raise HTTPException(status_code=409, detail="User changed or was removed. Please refresh the user list.")

    return {"message": "User removed"}

@router.post("/questions")
def add_question(question: QuestionCreate):

    result = questions_collection.insert_one({
        "question": question.question,
        "options": question.options,
        "correct_answer": question.correct_answer,
        "subject": question.subject
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
            "correct_answer": q["correct_answer"],
            "subject": q.get("subject")
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
                "correct_answer": question.correct_answer,
        "subject": question.subject
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
        result["quiz_name"] = result.get("quiz_name") or "General Quiz"

        results.append(result)

    return results

@router.get("/stats")
def get_stats():

    return {
        "total_users": users_collection.count_documents({}),
        "total_questions": questions_collection.count_documents({}),
        "total_results": results_collection.count_documents({})
    }


from app.models.batch import BatchConfig
from app.utils.batch import get_config, settings_collection

@router.get("/quiz-config")
def get_quiz_config():
    return get_config()

@router.put("/quiz-config")
def save_quiz_config(config: BatchConfig):
    settings_collection().replace_one({"_id": "default"}, {"_id": "default", **config.model_dump()}, upsert=True)
    return get_config()
