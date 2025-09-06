# routes/elections.py
from flask import Blueprint, request, jsonify, g
from db_connections import get_db_connection
from functools import wraps
import jwt
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")

elections_bp = Blueprint("elections", __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = None
        if header.startswith("Bearer "):
            token = header.split(" ", 1)[1]
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            g.user_id = payload.get("user_id")
            g.user_role = payload.get("role")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


# Create election (admin or presiding_officer)
@elections_bp.route("/elections", methods=["POST"])
@token_required
def create_election():
    if g.user_role not in ("admin", "presiding_officer"):
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}
    title = data.get("title")
    address_id = data.get("address_id")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    is_active = int(bool(data.get("is_active", 0)))

    if not all([title, address_id, start_date, end_date]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO elections (title, address_id, start_date, end_date, is_active)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (title, address_id, start_date, end_date, is_active),
        )
        conn.commit()
        return jsonify({"message": "Election created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# Get all elections (public)
@elections_bp.route("/elections", methods=["GET"])
def get_elections():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT e.id, e.title, e.address_id, e.start_date, e.end_date, e.is_active,
                   a.division, a.district, a.city, a.village, a.other_address_details
            FROM elections e
            LEFT JOIN addresses a ON e.address_id = a.id
            ORDER BY e.start_date DESC
            """
        )
        rows = cursor.fetchall()
        elections = []
        for r in rows:
            elections.append(
                {
                    "id": r["id"],
                    "title": r["title"],
                    "address_id": r["address_id"],
                    "start_date": r["start_date"].isoformat() if r["start_date"] else None,
                    "end_date": r["end_date"].isoformat() if r["end_date"] else None,
                    "is_active": bool(r["is_active"]),
                    "address": {
                        "division": r["division"],
                        "district": r["district"],
                        "city": r["city"],
                        "village": r["village"],
                        "other": r["other_address_details"],
                    },
                }
            )
        return jsonify(elections), 200
    finally:
        cursor.close()
        conn.close()


# Get single election (public)
@elections_bp.route("/elections/<int:election_id>", methods=["GET"])
def get_election(election_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT e.*, a.division, a.district, a.city, a.village, a.other_address_details
            FROM elections e
            LEFT JOIN addresses a ON e.address_id = a.id
            WHERE e.id = %s
            """,
            (election_id,),
        )
        r = cursor.fetchone()
        if not r:
            return jsonify({"error": "Election not found"}), 404
        election = {
            "id": r["id"],
            "title": r["title"],
            "address_id": r["address_id"],
            "start_date": r["start_date"].isoformat() if r["start_date"] else None,
            "end_date": r["end_date"].isoformat() if r["end_date"] else None,
            "is_active": bool(r["is_active"]),
            "address": {
                "division": r["division"],
                "district": r["district"],
                "city": r["city"],
                "village": r["village"],
                "other": r["other_address_details"],
            },
        }
        return jsonify(election), 200
    finally:
        cursor.close()
        conn.close()


# Update election (admin or presiding_officer)
@elections_bp.route("/elections/<int:election_id>", methods=["PUT"])
@token_required
def update_election(election_id):
    if g.user_role not in ("admin", "presiding_officer"):
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}
    title = data.get("title")
    address_id = data.get("address_id")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    is_active = int(bool(data.get("is_active", 0)))

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE elections
            SET title = %s, address_id = %s, start_date = %s, end_date = %s, is_active = %s
            WHERE id = %s
            """,
            (title, address_id, start_date, end_date, is_active, election_id),
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Election not found"}), 404
        return jsonify({"message": "Election updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# Delete election (admin only)
@elections_bp.route("/elections/<int:election_id>", methods=["DELETE"])
@token_required
def delete_election(election_id):
    if g.user_role != "admin":
        return jsonify({"error": "Forbidden"}), 403

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

@elections_bp.route("/elections/active", methods=["GET"])
def get_active_election():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT e.*, a.division, a.district, a.city, a.village, a.other_address_details
            FROM elections e
            LEFT JOIN addresses a ON e.address_id = a.id
            WHERE e.is_active = 1
            LIMIT 1
            """
        )
        r = cursor.fetchone()
        if not r:
            return jsonify({"error": "No active election"}), 404
        election = {
            "id": r["id"],
            "title": r["title"],
            "address_id": r["address_id"],
            "start_date": r["start_date"].isoformat() if r["start_date"] else None,
            "end_date": r["end_date"].isoformat() if r["end_date"] else None,
            "is_active": bool(r["is_active"]),
            "address": {
                "division": r["division"],
                "district": r["district"],
                "city": r["city"],
                "village": r["village"],
                "other": r["other_address_details"],
            },
        }
        return jsonify(election), 200
    finally:
        cursor.close()
        conn.close()