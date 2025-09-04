from flask import Blueprint, request, jsonify
from db_connections import get_db_connection
from datetime import datetime
elections_bp = Blueprint("elections", __name__)

# ------------------ Create Election ------------------
@elections_bp.route("/elections", methods=["POST"])
def create_election():
    data = request.get_json()

    title = data.get("title")
    address_id = data.get("address_id")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    is_active = data.get("is_active", 0)

    if not all([title, address_id, start_date, end_date]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    sql = """
        INSERT INTO elections (title, address_id, start_date, end_date, is_active)
        VALUES (%s, %s, %s, %s, %s)
    """
    try:
        cursor.execute(sql, (title, address_id, start_date, end_date, is_active))
        conn.commit()
        return jsonify({"message": "Election created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# ------------------ Get All Elections ------------------
@elections_bp.route("/elections", methods=["GET"])
def get_elections():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM elections ORDER BY start_date DESC")
        elections = cursor.fetchall()
        return jsonify(elections), 200
    finally:
        cursor.close()
        conn.close()


# ------------------ Get Single Election ------------------
@elections_bp.route("/elections/<int:election_id>", methods=["GET"])
def get_election(election_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM elections WHERE id = %s", (election_id,))
        election = cursor.fetchone()
        if election:
            return jsonify(election), 200
        return jsonify({"error": "Election not found"}), 404
    finally:
        cursor.close()
        conn.close()


# ------------------ Update Election ------------------
@elections_bp.route("/elections/<int:election_id>", methods=["PUT"])
def update_election(election_id):
    data = request.get_json()
    title = data.get("title")
    address_id = data.get("address_id")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    is_active = data.get("is_active")

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        sql = """
            UPDATE elections
            SET title = %s, address_id = %s, start_date = %s, end_date = %s, is_active = %s
            WHERE id = %s
        """
        cursor.execute(sql, (title, address_id, start_date, end_date, is_active, election_id))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Election not found"}), 404
        return jsonify({"message": "Election updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# ------------------ Delete Election ------------------
@elections_bp.route("/elections/<int:election_id>", methods=["DELETE"])
def delete_election(election_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM elections WHERE id = %s", (election_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Election not found"}), 404
        return jsonify({"message": "Election deleted successfully"}), 200
    finally:
        cursor.close()
        conn.close()
