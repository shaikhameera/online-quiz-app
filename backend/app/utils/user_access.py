from fastapi import HTTPException


def user_response(user):
    return {
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        # Missing values preserve access for accounts created before these fields existed.
        "can_take_test": user.get("can_take_test", True),
        "can_retake_test": user.get("can_retake_test", True),
        "is_first_login": user.get("is_first_login", False),
    }


def current_database_user(request, users_collection, require_password_change=True):
    session_user = request.session.get("user")
    if not session_user or not session_user.get("email"):
        raise HTTPException(status_code=401, detail="Login Required")

    user = users_collection.find_one({"email": session_user["email"]})
    if not user:
        request.session.clear()
        raise HTTPException(status_code=401, detail="Account no longer exists")
    if require_password_change and user.get("is_first_login", False):
        raise HTTPException(status_code=403, detail="Change your default password before continuing")
    return user
