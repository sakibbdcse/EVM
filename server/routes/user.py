from flask import Blueprint, request, jsonify
import jwt
import os
from db_connections import get_db_connection
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")

user_bp = Blueprint("user", __name__)

# ------------------ Current User ------------------
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
        if conn is None:
            return jsonify({"error": "DB connection failed"}), 500
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, username, first_name, last_name, email, phone, gender, birthdate, nid, role
            FROM users
            WHERE id=%s
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
                "birthdate": user[7],
                "nid": user[8],
                "role": user[9]
            }), 200
        else:
            return jsonify({"error": "User not found"}), 404

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except Exception as e:
        print("JWT decode error:", e)
        return jsonify({"error": "Invalid token"}), 401
    finally:
        if "cursor" in locals() and cursor: cursor.close()
        if "conn" in locals() and conn: conn.close()


# ------------------ Get All Users (Admin / Presiding Officer) ------------------
@user_bp.route("/all", methods=["GET"])
def get_all_users():
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        return jsonify({"error": "No token found"}), 401

    token = token.split(" ")[1]

    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        role = data.get("role")

        # ✅ Allow only admin or presiding_officer
        if role not in ("admin", "presiding_officer"):
            return jsonify({"error": "Forbidden - Only Admin/Presiding Officer"}), 403

        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "DB connection failed"}), 500
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, username, first_name, last_name, email, phone, gender, birthdate, nid, role
            FROM users
        """)
        rows = cursor.fetchall()

        users = []
        for row in rows:
            users.append({
                "id": row[0],
                "username": row[1],
                "first_name": row[2],
                "last_name": row[3],
                "email": row[4],
                "phone": row[5],
                "gender": row[6],
                "birthdate": row[7],
                "nid": row[8],
                "role": row[9]
            })

        return jsonify(users), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except Exception as e:
        print("JWT decode error:", e)
        return jsonify({"error": "Invalid token"}), 401
    finally:
        if "cursor" in locals() and cursor: cursor.close()
        if "conn" in locals() and conn: conn.close()
