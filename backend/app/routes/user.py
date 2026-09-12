from fastapi import APIRouter, Depends, Request, HTTPException
from app.models.user import PasswordChange, UserLogin, UserRegister
from app.database import users_collection
from app.utils.security import hash_password, verify_password
from app.utils.user_access import current_database_user, user_response
from app.utils.api_key import verify_api_key

router = APIRouter(
    prefix="/user",
    tags=["Users"],
    dependencies=[Depends(verify_api_key)]
)

@router.post("/register")
def register(user: UserRegister):

    existing = users_collection.find_one(
        {"email": user.email}
    )

    if existing:
        return {
            "message": "Email already exists"
        }

    users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": "user",
        "can_take_test": False,
        "can_retake_test": False,
        "is_first_login": False
    })

    return {
        "message": "User registered"
    }


@router.post("/login")
def login(
    user: UserLogin,
    request: Request
):

    db_user = users_collection.find_one(
        {"email": user.email}
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email"
        )

    if not verify_password(
        user.password,
        db_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Password"
        )

    request.session["user"] = {
        "email": db_user["email"],
        "name": db_user["name"],
        "role": db_user["role"]
    }

    return {
        "message": "Login Successful"
    }

@router.get("/logout")
def logout(request: Request):

    request.session.clear()

    return {
        "message": "Logged Out"
    }

@router.get("/me")
def get_me(request: Request):
    return user_response(current_database_user(request, users_collection, require_password_change=False))


@router.post("/change-password")
def change_password(payload: PasswordChange, request: Request):
    user = current_database_user(request, users_collection, require_password_change=False)
    if not verify_password(payload.current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if verify_password(payload.new_password, user["password"]):
        raise HTTPException(status_code=400, detail="New password must be different from the current password")

    result = users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password": hash_password(payload.new_password),
            "is_first_login": False,
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Password changed successfully"}
