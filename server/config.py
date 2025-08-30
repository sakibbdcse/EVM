import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
BASE_URL = os.getenv("BASE_URL", "http://localhost:5000")