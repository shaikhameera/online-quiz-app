from fastapi import Request, HTTPException

def admin_required(request: Request):

    user = request.session.get("user")

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Login Required"
        )

    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin Access Required"
        )

    return user
