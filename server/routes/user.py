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
    print("Token received:", token)
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
        
        # Select all needed columns
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
        print(e)
        return jsonify({"error": "Invalid token"}), 401
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
