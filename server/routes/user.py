from flask import Blueprint, request, jsonify, send_from_directory
import jwt
import os
from db_connections import get_db_connection
from dotenv import load_dotenv
from datetime import date, datetime
from werkzeug.utils import secure_filename

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
    # Include blueprint prefix /user in URL
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

# ------------------ Edit User ------------------
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
        body["photo"] = filename  # store only filename in DB

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

        cursor.execute("""
            SELECT id, username, first_name, last_name, email, phone, gender, 
                   birthdate, nid, role, address_id, photo
            FROM users WHERE id=%s
        """, (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        updated_user = {
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
        }
        return jsonify(updated_user), 200
    except Exception as e:
        print("Update error:", e)
        return jsonify({"error": "Failed to update user"}), 400
    finally:
        cursor.close()
        conn.close()

# ------------------ Get Current User ------------------
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
        cursor.execute("""
            SELECT id, username, first_name, last_name, email, phone, gender, 
                   birthdate, nid, role, address_id, photo
            FROM users WHERE id=%s
        """, (user_id,))
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
