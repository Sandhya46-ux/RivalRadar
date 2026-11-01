
import os
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env")

TINYFISH_API_KEY = os.getenv("TINYFISH_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")


def validate_config():
    missing = []

    if not TINYFISH_API_KEY:
        missing.append("TINYFISH_API_KEY")

    if not GEMINI_API_KEY:
        missing.append("GEMINI_API_KEY")

    if missing:
        raise RuntimeError(
            "Missing environment variables: " + ", ".join(missing)
        )
