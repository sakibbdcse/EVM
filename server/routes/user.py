from flask import Blueprint, request, jsonify
import jwt
import os
from db_connections import get_db_connection
from dotenv import load_dotenv
from datetime import date, datetime

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
user_bp = Blueprint("user", __name__)

# ------------------ Helper ------------------
def format_date(value):
    if isinstance(value, (date, datetime)):
        return value.strftime("%Y-%m-%d")
    return value

# ------------------ Edit User ------------------
@user_bp.route("/edit/<int:user_id>", methods=["PUT"])
def edit_user(user_id):
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        return jsonify({"error": "No token found"}), 401

    token = token.split(" ")[1]

    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        requester_id = data.get("user_id")
        requester_role = data.get("role")

        if requester_role not in ("admin", "presiding_officer") and requester_id != user_id:
            return jsonify({"error": "Forbidden"}), 403

        # Get form data
        body = request.form.to_dict()
        file = request.files.get("photo")

        if file:
            os.makedirs("uploads", exist_ok=True)
            file_path = os.path.join("uploads", file.filename)
            file.save(file_path)
            body["photo"] = file_path

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
            return jsonify({"error": "No valid fields to update"}), 400

        values.append(user_id)
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = f"UPDATE users SET {', '.join(updates)} WHERE id=%s"
        cursor.execute(sql, tuple(values))
        conn.commit()

        # Return updated user
        cursor.execute("""
            SELECT id, username, first_name, last_name, email, phone, gender, 
                   birthdate, nid, role, address_id, photo
            FROM users WHERE id=%s
        """, (user_id,))
        user = cursor.fetchone()
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
            "photo": user[11]
        }

        return jsonify(updated_user), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except Exception as e:
        print("Update error:", e)
        return jsonify({"error": "Invalid request"}), 400
    finally:
        if "cursor" in locals(): cursor.close()
        if "conn" in locals(): conn.close()

# ------------------ Get Current User ------------------
@user_bp.route("/current-user", methods=["GET"])
def current_user():
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        return jsonify({"error": "No token found"}), 401

    token = token.split(" ")[1]
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = data["user_id"]
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, first_name, last_name, email, phone, gender, 
                   birthdate, nid, role, address_id, photo
            FROM users WHERE id=%s
        """, (user_id,))
        user = cursor.fetchone()
        if user:
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
                "photo": user[11]
            }), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        print("JWT error:", e)
        return jsonify({"error": "Invalid token"}), 401
    finally:
        if "cursor" in locals(): cursor.close()
        if "conn" in locals(): conn.close()
