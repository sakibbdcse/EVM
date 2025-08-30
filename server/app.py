from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from db_connections import init_app, get_db_connection
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
init_app(app)
CORS(app, origins=["http://localhost:5173"])  # Allow React frontend

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    # Required fields
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    phone = data.get("phone")

    # Optional fields
    gender = data.get("gender")
    nid = data.get("nid")
    birthdate = data.get("birthdate")

    # Validate required fields
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


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        sql = "SELECT id, username, password FROM users WHERE username = %s"
        cursor.execute(sql, (username,))
        user = cursor.fetchone()

        if user and check_password_hash(user[2], password):
            return jsonify({
                "message": "Login successful",
                "redirect_url": "/dashboard",
                "user": {"id": user[0], "username": user[1]}
            }), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401
    finally:
        cursor.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
