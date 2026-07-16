from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from app.routes.user import router as user_router
from app.routes.questions import router as questions_router
from app.routes.admin import router as admin_router
from app.routes.quiz import router as quiz_router
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://quiz-app-by-ameera.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY")
)

app.include_router(admin_router)
app.include_router(user_router)
app.include_router(questions_router)
app.include_router(quiz_router)
