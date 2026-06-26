from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

db = client["online_quiz"]

users_collection = db["users"]
questions_collection = db["questions"]
results_collection = db["results"]
