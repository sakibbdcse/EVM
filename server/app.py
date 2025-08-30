from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash,check_password_hash
import os
from dotenv import load_dotenv
from db_connections import init_app, get_db_connection

load_dotenv()

app = Flask(__name__)
init_app(app)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        plain_text_password = request.form.get('password')
        email = request.form.get('email')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        phone = request.form.get('phone')
        address = request.form.get('address')
        nid = request.form.get('nid')
        gender = request.form.get('gender')

        # Validation
        if not all([first_name, last_name, username, plain_text_password, email, phone]):
            return jsonify({"error": "first_name, last_name, username, password, email, and phone are required"}), 400
        
        # Secure password hashing
        hashed_password = generate_password_hash(plain_text_password, method='pbkdf2:sha256')

        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor()

        sql = """
            INSERT INTO users (username, password, email, first_name, last_name, nid, gender, role, date_joined, has_voted)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'voter', NOW(), 0)
        """
        values = (username, hashed_password, email, first_name, last_name, nid, gender)

        try:
            cursor.execute(sql, values)
            conn.commit()
            return jsonify({"message": "User registered successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400
        finally:
            cursor.close()

    return jsonify({
        "message": "Register Page",
        "required_fields": ["username", "password", "email", "first_name", "last_name", "nid", "gender"]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
