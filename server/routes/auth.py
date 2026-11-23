from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta, timezone
import re
from db_connections import get_db_cursor
import config

auth_bp = Blueprint("auth", __name__)

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

# ------------------ Register ------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}

    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    email = (data.get("email") or "").strip()
    first_name = (data.get("firstName") or data.get("first_name") or "").strip()
    last_name = (data.get("lastName") or data.get("last_name") or "").strip()
    phone = (data.get("phone") or "").strip()
    gender = data.get("gender")
    nid = (data.get("nid") or "").strip()
    birthdate = data.get("birthdate")
    address_id = data.get("address_id")

    if not all([username, password, email, first_name, last_name, phone, nid]):
        return jsonify({"error": "All required fields must be provided (Username, Password, Email, First Name, Last Name, Phone, NID)."}), 400

    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters long."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Please provide a valid email address."}), 400

    # Format gender cleanly
    formatted_gender = "Other"
    if gender:
        g_lower = gender.lower()
        if g_lower == "male":
            formatted_gender = "Male"
        elif g_lower == "female":
            formatted_gender = "Female"

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            # Check unique constraints
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({"error": f"Username '{username}' is already taken."}), 409

            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({"error": f"Email '{email}' is already registered."}), 409

            cursor.execute("SELECT id FROM users WHERE phone = %s", (phone,))
            if cursor.fetchone():
                return jsonify({"error": f"Phone number '{phone}' is already registered."}), 409

            cursor.execute("SELECT id FROM users WHERE nid = %s", (nid,))
            if cursor.fetchone():
                return jsonify({"error": f"NID '{nid}' is already registered."}), 409

            sql = """
                INSERT INTO users
                (username, password, email, first_name, last_name, phone, gender, nid, birthdate, role, date_joined, has_voted, address_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'voter', NOW(), 0, %s)
            """
            values = (username, hashed_password, email, first_name, last_name, phone, formatted_gender, nid, birthdate or None, address_id or None)
            cursor.execute(sql, values)
            new_id = cursor.lastrowid

            return jsonify({
                "message": "User registered successfully! You may now log in.",
                "user_id": new_id
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ------------------ Login ------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    login_id = (data.get("login_id") or data.get("email") or "").strip()
    password = data.get("password") or ""

    if not login_id or not password:
        return jsonify({"error": "Login ID and password are required."}), 400

    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            sql = """
                SELECT u.id, u.username, u.email, u.phone, u.password, u.role,
                       u.first_name, u.last_name, u.gender, u.birthdate, u.nid,
                       u.has_voted, u.address_id, u.photo,
                       a.division, a.district, a.city, a.village, a.other_address_details
                FROM users u
                LEFT JOIN addresses a ON u.address_id = a.id
                WHERE u.username = %s OR u.email = %s OR u.phone = %s
            """
            cursor.execute(sql, (login_id, login_id, login_id))
            user = cursor.fetchone()

            if not user or not check_password_hash(user["password"], password):
                return jsonify({"error": "Invalid username/email or password."}), 401

            # 24-hour token validity
            payload = {
                "user_id": user["id"],
                "role": user["role"],
                "username": user["username"],
                "exp": datetime.now(timezone.utc) + timedelta(hours=24)
            }
            token = jwt.encode(payload, config.SECRET_KEY, algorithm="HS256")

            address_info = None
            if user["address_id"]:
                address_info = {
                    "id": user["address_id"],
                    "division": user["division"],
                    "district": user["district"],
                    "city": user["city"],
                    "village": user["village"],
                    "other_address_details": user["other_address_details"]
                }

            user_data = {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "phone": user["phone"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "gender": user["gender"],
                "birthdate": user["birthdate"].isoformat() if user["birthdate"] else None,
                "nid": user["nid"],
                "role": user["role"],
                "has_voted": bool(user["has_voted"]),
                "address_id": user["address_id"],
                "address": address_info,
                "photo": user["photo"],
                "photo_url": f"/user/uploads/profile/{user['photo']}" if user["photo"] else None
            }

            return jsonify({
                "message": "Login successful!",
                "user": user_data,
                "token": token
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
