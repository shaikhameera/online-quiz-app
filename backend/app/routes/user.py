from fastapi import APIRouter, Depends
from app.models.user import UserRegister
from app.database import users_collection
from app.utils.security import hash_password
from fastapi import Request
from app.models.user import UserLogin
from app.database import users_collection
from app.utils.security import verify_password
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
        "role": "user"
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
        return {"message": "Invalid Email"}

    if not verify_password(
        user.password,
        db_user["password"]
    ):
        return {"message": "Invalid Password"}

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

    user = request.session.get("user")

    if not user:
        return {
            "message": "Not Logged In"
        }

    return user
