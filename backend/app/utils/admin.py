from fastapi import Request, HTTPException
from app.utils.user_access import current_database_user

def admin_required(request: Request):

    from app.database import users_collection
    user = current_database_user(request, users_collection)

    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin Access Required"
        )

    return user
