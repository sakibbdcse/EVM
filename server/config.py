import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "evm-super-secure-production-key-2026")
BASE_URL = os.getenv("BASE_URL", "http://localhost:5000")
CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:5173")

# MySQL Configuration with fallback defaults
DB_HOST = os.getenv("HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("PASSWORD", "")
DB_NAME = os.getenv("DB", "voting_db")
DB_PORT = int(os.getenv("PORT", "3306"))

# Upload Directories
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
PROFILE_FOLDER = os.path.join(UPLOAD_FOLDER, "profile")
SYMBOL_FOLDER = os.path.join(UPLOAD_FOLDER, "symbols")

os.makedirs(PROFILE_FOLDER, exist_ok=True)
os.makedirs(SYMBOL_FOLDER, exist_ok=True)
