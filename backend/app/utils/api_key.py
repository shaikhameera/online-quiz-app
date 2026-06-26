from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader
from dotenv import load_dotenv
import os

load_dotenv()

API_SECRET_KEY = os.getenv("API_SECRET_KEY")

api_key_header = APIKeyHeader(
    name="X-API-Key",
    auto_error=False
)

def verify_api_key(
    api_key: str = Security(api_key_header)
):
    if api_key != API_SECRET_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key"
        )
