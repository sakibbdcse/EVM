from flask import Blueprint, request, jsonify, send_from_directory
import jwt
import os
from db_connections import get_db_connection
from dotenv import load_dotenv
from datetime import date, datetime, timedelta
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")

# ------------------ Upload Folders ------------------
UPLOAD_FOLDER = "uploads"
PROFILE_FOLDER = os.path.abspath(os.path.join(UPLOAD_FOLDER, "profile"))
os.makedirs(PROFILE_FOLDER, exist_ok=True)

user_bp = Blueprint("user", __name__)

# ------------------ Helpers ------------------
def format_date(value):
    if isinstance(value, (date, datetime)):
        return value.strftime("%Y-%m-%d")
    return value

def build_photo_url(filename):
    if not filename:
        return None
    return request.host_url.rstrip("/") + f"/user/uploads/profile/{filename}"

def verify_token(auth_header):
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, jsonify({"error": "Invalid or missing token"}), 401
    token = auth_header.split(" ")[1]
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return data, None, None
    except jwt.ExpiredSignatureError:
        return None, jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({"error": "Invalid token"}), 401

# ------------------ Serve Uploaded Files ------------------
@user_bp.route("/uploads/profile/<filename>")
def uploaded_profile_file(filename):
    file_path = os.path.join(PROFILE_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    return send_from_directory(PROFILE_FOLDER, filename)

# ------------------ Register User ------------------
@user_bp.route("/register", methods=["POST"])
def register_user():
    data = request.form if request.form else request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "voter")

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    hashed_password = generate_password_hash(password)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)",
            (username, email, hashed_password, role),
        )
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print("Register error:", e)
        return jsonify({"error": "Failed to register user"}), 400
    finally:
        cursor.close()
        conn.close()

# ------------------ Login User ------------------
@user_bp.route("/login", methods=["POST"])
def login_user():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, password, role FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()
        if not user or not check_password_hash(user[1], password):
            return jsonify({"error": "Invalid credentials"}), 401

        token = jwt.encode(
            {
                "user_id": user[0],
                "role": user[2],
                "exp": datetime.utcnow() + timedelta(hours=24),
            },
            SECRET_KEY,
            algorithm="HS256",
        )
        return jsonify({"token": token}), 200
    except Exception as e:
        print("Login error:", e)
        return jsonify({"error": "Login failed"}), 400
    finally:
        cursor.close()
        conn.close()

# ------------------ Get All Users (Admin + Presiding Officer) ------------------
@user_bp.route("/all", methods=["GET"])
def get_all_users():
    auth_header = request.headers.get("Authorization")
    data, err_response, status = verify_token(auth_header)
    if err_response:
        return err_response, status

    # ✅ allow both admin and presiding_officer
    if data.get("role") not in ("admin", "presiding_officer"):
        return jsonify({"error": "Forbidden"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                id, username, email, first_name, last_name, phone, gender, 
                birthdate, nid, role, has_voted, date_joined, address_id, photo 
            FROM users
        """)
        users = cursor.fetchall()
        return jsonify([
            {
                "id": u[0],
                "username": u[1],
                "email": u[2],
                "first_name": u[3],
                "last_name": u[4],
                "phone": u[5],
                "gender": u[6],
                "birthdate": format_date(u[7]),
                "nid": u[8],
                "role": u[9],
                "has_voted": bool(u[10]),
                "date_joined": format_date(u[11]),
                "address_id": u[12],
                "photo": u[13],
                "photo_url": build_photo_url(u[13])
            } for u in users
        ]), 200
    except Exception as e:
        print("Fetch all users error:", e)
        return jsonify({"error": "Failed to fetch users"}), 400
    finally:
        cursor.close()
        conn.close()

# ------------------ Get Single User ------------------
@user_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    auth_header = request.headers.get("Authorization")
    data, err_response, status = verify_token(auth_header)
    if err_response:
        return err_response, status

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, username, first_name, last_name, email, phone, gender, birthdate, nid, role, address_id, photo FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": user[0],
            "username": user[1],
            "first_name": user[2],
            "last_name": user[3],
            "email": user[4],
            "phone": user[5],
            "gender": user[6],
            "birthdate": format_date(user[7]),
            "nid": user[8],
            "role": user[9],
            "address_id": user[10],
            "photo": user[11],
            "photo_url": build_photo_url(user[11])
        }), 200
    except Exception as e:
        print("Fetch user error:", e)
        return jsonify({"error": "Failed to fetch user"}), 400
    finally:
        cursor.close()
        conn.close()

# ------------------ Edit User (keep your existing one) ------------------
@user_bp.route("/edit/<int:user_id>", methods=["PUT"])
def edit_user(user_id):
    auth_header = request.headers.get("Authorization")
    data, err_response, status = verify_token(auth_header)
    if err_response:
        return err_response, status

    requester_id = data.get("user_id")
    requester_role = data.get("role")
    if requester_role not in ("admin", "presiding_officer") and requester_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    body = request.form.to_dict()
    file = request.files.get("photo")
    if file:
        filename = secure_filename(f"user_{user_id}_{file.filename}")
        file_path = os.path.join(PROFILE_FOLDER, filename)
        file.save(file_path)
        body["photo"] = filename

    fields = [
        "username", "first_name", "last_name", "email",
        "phone", "gender", "birthdate", "nid", "role", "address_id", "photo"
    ]

    updates = []
    values = []
    for field in fields:
        if field in body:
            updates.append(f"{field}=%s")
            values.append(body[field])

    if not updates:
        return jsonify({"error": "No fields to update"}), 400

    values.append(user_id)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        sql = f"UPDATE users SET {', '.join(updates)} WHERE id=%s"
        cursor.execute(sql, tuple(values))
        conn.commit()

        cursor.execute("SELECT id, username, first_name, last_name, email, phone, gender, birthdate, nid, role, address_id, photo FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": user[0],
            "username": user[1],
            "first_name": user[2],
            "last_name": user[3],
            "email": user[4],
            "phone": user[5],
            "gender": user[6],
            "birthdate": format_date(user[7]),
            "nid": user[8],
            "role": user[9],
            "address_id": user[10],
            "photo": user[11],
            "photo_url": build_photo_url(user[11])
        }), 200
    except Exception as e:
        print("Update error:", e)
        return jsonify({"error": "Failed to update user"}), 400
    finally:
        cursor.close()
        conn.close()

# ------------------ Delete User (Admin only) ------------------
@user_bp.route("/delete/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    auth_header = request.headers.get("Authorization")
    data, err_response, status = verify_token(auth_header)
    if err_response:
        return err_response, status
    if data.get("role") != "admin":
        return jsonify({"error": "Forbidden"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))
        conn.commit()
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        print("Delete error:", e)
        return jsonify({"error": "Failed to delete user"}), 400
    finally:
        cursor.close()
        conn.close()

# ------------------ Get Current User (keep existing) ------------------
@user_bp.route("/current-user", methods=["GET"])
def current_user():
    auth_header = request.headers.get("Authorization")
    data, err_response, status = verify_token(auth_header)
    if err_response:
        return err_response, status

    user_id = data["user_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, username, first_name, last_name, email, phone, gender, birthdate, nid, role, address_id, photo FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": user[0],
            "username": user[1],
            "first_name": user[2],
            "last_name": user[3],
            "email": user[4],
            "phone": user[5],
            "gender": user[6],
            "birthdate": format_date(user[7]),
            "nid": user[8],
            "role": user[9],
            "address_id": user[10],
            "photo": user[11],
            "photo_url": build_photo_url(user[11])
        }), 200
    except Exception as e:
        print("Fetch user error:", e)
        return jsonify({"error": "Failed to fetch user"}), 400
    finally:
        cursor.close()
        conn.close()
