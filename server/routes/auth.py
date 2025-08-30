from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
from db_connections import get_db_connection
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")

auth_bp = Blueprint("auth", __name__)

# ------------------ Register ------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    username = data.get("username")
    password = data.get("password")
    email = data.get("email")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    phone = data.get("phone")
    gender = data.get("gender")
    nid = data.get("nid")
    birthdate = data.get("birthdate")

    if not all([username, password, email, first_name, last_name, phone]):
        return jsonify({"error": "Missing required fields"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    sql = """
        INSERT INTO users
        (username, password, email, first_name, last_name, phone, gender, nid, birthdate, role, date_joined, has_voted)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'voter', NOW(), 0)
    """
    values = (username, hashed_password, email, first_name, last_name, phone, gender, nid, birthdate)

    try:
        cursor.execute(sql, values)
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# ------------------ Login ------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    login_id = data.get("login_id")  # username/email/phone
    password = data.get("password")

    if not login_id or not password:
        return jsonify({"error": "Login ID and password are required"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        sql = """
            SELECT id, username, email, phone, password, role
            FROM users
            WHERE username = %s OR email = %s OR phone = %s
        """
        cursor.execute(sql, (login_id, login_id, login_id))
        user = cursor.fetchone()

        if user and check_password_hash(user[4], password):
            token = jwt.encode(
                {
                    "user_id": user[0],
                    "role": user[5],
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
                },
                SECRET_KEY,
                algorithm="HS256"
            )
            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2],
                    "phone": user[3],
                    "role": user[5]
                },
                "token": token
            }), 200
        else:
            return jsonify({"error": "Invalid login credentials"}), 401
    finally:
        cursor.close()
        conn.close()
