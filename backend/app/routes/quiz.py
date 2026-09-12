from fastapi import APIRouter, Request, HTTPException
from bson import ObjectId
from datetime import datetime, timezone
from random import SystemRandom

from app.database import (
    questions_collection,
    results_collection,
    users_collection
)

from app.models.quiz import QuizSubmission
from app.utils.user_access import current_database_user

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)

question_randomizer = SystemRandom()


def ensure_test_start_access(user):
    has_completed_test = results_collection.count_documents(
        {"user_email": user["email"]}, limit=1
    ) > 0
    if has_completed_test and not user.get("can_retake_test", True):
        raise HTTPException(status_code=403, detail="Your test retake has not been enabled by an administrator")
    if not has_completed_test and not user.get("can_take_test", True):
        raise HTTPException(status_code=403, detail="Your test access has not been enabled by an administrator")

@router.get("/history")
def get_history(request: Request):
    user = current_database_user(request, users_collection)

    history = []
    for result in results_collection.find(
        {"user_email": user["email"]},
        {"score": 1, "total_questions": 1, "percentage": 1, "submitted_at": 1, "quiz_name": 1}
    ).sort([("submitted_at", -1), ("_id", -1)]):
        submitted_at = result["submitted_at"]
        if submitted_at.tzinfo is None:
            submitted_at = submitted_at.replace(tzinfo=timezone.utc)
        history.append({
            "result_id": str(result["_id"]),
            "quiz_name": result.get("quiz_name") or "General Quiz",
            "score": result["score"],
            "total_questions": result["total_questions"],
            "percentage": result["percentage"],
            "submitted_at": submitted_at.isoformat()
        })
    return history


@router.post("/submit")
def submit_quiz(
    submission: QuizSubmission,
    request: Request
):

    user = current_database_user(request, users_collection)

    if submission.attempt_id:
        return submit_batch(submission, user)

    ensure_test_start_access(user)

    from app.utils.batch import get_config
    if get_config()["subjects"]:
        raise HTTPException(status_code=400, detail="Start a new quiz before submitting")

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

    total_questions = questions_collection.count_documents({})

    percentage = (
        score / total_questions * 100
        if total_questions > 0
        else 0
    )

    result = {
        "quiz_name": "General Quiz",
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
        "quiz_name": "General Quiz",
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


@router.post("/start")
def start_batch(request: Request):
    from app.database import quiz_attempts_collection
    from app.utils.batch import get_config
    user = current_database_user(request, users_collection)
    ensure_test_start_access(user)
    config = get_config()
    selected = []
    for subject in config["subjects"]:
        questions = list(questions_collection.find({"subject": subject["name"]}).sort("_id", 1))
        if not questions:
            raise HTTPException(status_code=400, detail=f"No questions available for {subject['name']}. Please contact the administrator.")
        question_randomizer.shuffle(questions)
        selected.extend(questions)
    if not config["subjects"]:
        selected = list(questions_collection.find().sort("_id", 1))
        question_randomizer.shuffle(selected)
    if not selected:
        raise HTTPException(status_code=400, detail="No questions available")
    questions = [{"id": str(q["_id"]), "question": q["question"], "options": q["options"],
                  "correct_answer": q["correct_answer"], "subject": q.get("subject") or "Unassigned"} for q in selected]
    now = datetime.now(timezone.utc)
    duration = config["duration_seconds"] or 60
    from datetime import timedelta
    expires = now + timedelta(seconds=duration)
    attempt = {"user_email": user["email"], "quiz_name": config["quiz_name"], "questions": questions,
               "duration_seconds": duration, "expires_at": expires}
    inserted = quiz_attempts_collection.insert_one(attempt)
    return {"attempt_id": str(inserted.inserted_id), "quiz_name": config["quiz_name"],
            "duration_seconds": config["duration_seconds"], "expires_at": expires.isoformat(),
            "questions": [{k: v for k, v in q.items() if k != "correct_answer"} for q in questions]}


def submit_batch(submission, user):
    from app.database import quiz_attempts_collection
    try:
        attempt_id = ObjectId(submission.attempt_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid attempt ID")
    attempt = quiz_attempts_collection.find_one({"_id": attempt_id, "user_email": user["email"]})
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found")
    existing = results_collection.find_one({"_id": attempt_id})
    if existing:
        return batch_result(existing)
    answers = {answer.question_id: answer.selected_answer for answer in submission.answers}
    valid_ids = {q["id"] for q in attempt["questions"]}
    if len(answers) != len(submission.answers) or not set(answers).issubset(valid_ids):
        raise HTTPException(status_code=400, detail="Invalid or duplicate quiz answers")
    recorded = []
    for question in attempt["questions"]:
        selected = answers.get(question["id"], "")
        if selected and selected not in question["options"]:
            raise HTTPException(status_code=400, detail="Invalid answer option")
        recorded.append({"question_id": question["id"], "subject": question["subject"],
                         "selected_answer": selected, "correct_answer": question["correct_answer"],
                         "is_correct": selected == question["correct_answer"]})
    total = len(recorded)
    score = sum(answer["is_correct"] for answer in recorded)
    result = {"_id": attempt_id, "user_email": user["email"], "user_name": user["name"],
              "quiz_name": attempt["quiz_name"], "duration_seconds": attempt["duration_seconds"],
              "score": score, "total_questions": total, "percentage": round(score / total * 100, 2) if total else 0,
              "submitted_at": datetime.now(timezone.utc), "answers": recorded}
    results_collection.update_one({"_id": attempt_id}, {"$setOnInsert": result}, upsert=True)
    return batch_result(results_collection.find_one({"_id": attempt_id}))


def batch_result(result):
    return {"result_id": str(result["_id"]), "quiz_name": result["quiz_name"], "score": result["score"],
            "total_questions": result["total_questions"], "percentage": result["percentage"], "message": "Quiz Submitted"}
