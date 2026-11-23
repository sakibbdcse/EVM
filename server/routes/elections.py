from flask import Blueprint, request, jsonify, g
from db_connections import get_db_cursor
from middleware import token_required, roles_required
from datetime import datetime

elections_bp = Blueprint("elections", __name__)

# ------------------ Get All Elections (Public with Query Filters) ------------------
@elections_bp.route("/elections", methods=["GET"])
def get_elections():
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            cursor.execute(
                """
                SELECT e.id, e.title, e.description, e.address_id, e.start_date, e.end_date, e.is_active,
                       a.division, a.district, a.city, a.village, a.other_address_details,
                       (SELECT COUNT(*) FROM candidates c WHERE c.election_id = e.id) AS candidate_count,
                       (SELECT COUNT(*) FROM votes v WHERE v.election_id = e.id) AS vote_count
                FROM elections e
                LEFT JOIN addresses a ON e.address_id = a.id
                ORDER BY e.is_active DESC, e.start_date DESC
                """
            )
            rows = cursor.fetchall()
            now = datetime.now()
            elections = []
            for r in rows:
                status = "ongoing"
                if not r["is_active"]:
                    status = "inactive"
                elif r["start_date"] and now < r["start_date"]:
                    status = "upcoming"
                elif r["end_date"] and now > r["end_date"]:
                    status = "ended"

                elections.append({
                    "id": r["id"],
                    "title": r["title"],
                    "description": r["description"] or "",
                    "address_id": r["address_id"],
                    "start_date": r["start_date"].isoformat() if r["start_date"] else None,
                    "end_date": r["end_date"].isoformat() if r["end_date"] else None,
                    "is_active": bool(r["is_active"]),
                    "status": status,
                    "candidate_count": r["candidate_count"],
                    "vote_count": r["vote_count"],
                    "address": {
                        "id": r["address_id"],
                        "division": r["division"],
                        "district": r["district"],
                        "city": r["city"],
                        "village": r["village"],
                        "other": r["other_address_details"],
                    },
                })
            return jsonify(elections), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Get Active Election ------------------
@elections_bp.route("/elections/active", methods=["GET"])
def get_active_election():
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            cursor.execute(
                """
                SELECT e.*, a.division, a.district, a.city, a.village, a.other_address_details,
                       (SELECT COUNT(*) FROM candidates c WHERE c.election_id = e.id) AS candidate_count,
                       (SELECT COUNT(*) FROM votes v WHERE v.election_id = e.id) AS vote_count
                FROM elections e
                LEFT JOIN addresses a ON e.address_id = a.id
                WHERE e.is_active = 1
                ORDER BY e.start_date DESC
                LIMIT 1
                """
            )
            r = cursor.fetchone()
            if not r:
                return jsonify({"error": "No active election currently found"}), 404

            now = datetime.now()
            status = "ongoing"
            if r["start_date"] and now < r["start_date"]:
                status = "upcoming"
            elif r["end_date"] and now > r["end_date"]:
                status = "ended"

            return jsonify({
                "id": r["id"],
                "title": r["title"],
                "description": r["description"] or "",
                "address_id": r["address_id"],
                "start_date": r["start_date"].isoformat() if r["start_date"] else None,
                "end_date": r["end_date"].isoformat() if r["end_date"] else None,
                "is_active": bool(r["is_active"]),
                "status": status,
                "candidate_count": r["candidate_count"],
                "vote_count": r["vote_count"],
                "address": {
                    "id": r["address_id"],
                    "division": r["division"],
                    "district": r["district"],
                    "city": r["city"],
                    "village": r["village"],
                    "other": r["other_address_details"],
                },
            }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Get Single Election ------------------
@elections_bp.route("/elections/<int:election_id>", methods=["GET"])
def get_election(election_id):
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            cursor.execute(
                """
                SELECT e.*, a.division, a.district, a.city, a.village, a.other_address_details,
                       (SELECT COUNT(*) FROM candidates c WHERE c.election_id = e.id) AS candidate_count,
                       (SELECT COUNT(*) FROM votes v WHERE v.election_id = e.id) AS vote_count
                FROM elections e
                LEFT JOIN addresses a ON e.address_id = a.id
                WHERE e.id = %s
                """,
                (election_id,),
            )
            r = cursor.fetchone()
            if not r:
                return jsonify({"error": "Election not found"}), 404

            now = datetime.now()
            status = "ongoing"
            if not r["is_active"]:
                status = "inactive"
            elif r["start_date"] and now < r["start_date"]:
                status = "upcoming"
            elif r["end_date"] and now > r["end_date"]:
                status = "ended"

            return jsonify({
                "id": r["id"],
                "title": r["title"],
                "description": r["description"] or "",
                "address_id": r["address_id"],
                "start_date": r["start_date"].isoformat() if r["start_date"] else None,
                "end_date": r["end_date"].isoformat() if r["end_date"] else None,
                "is_active": bool(r["is_active"]),
                "status": status,
                "candidate_count": r["candidate_count"],
                "vote_count": r["vote_count"],
                "address": {
                    "id": r["address_id"],
                    "division": r["division"],
                    "district": r["district"],
                    "city": r["city"],
                    "village": r["village"],
                    "other": r["other_address_details"],
                },
            }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Create Election ------------------
@elections_bp.route("/elections", methods=["POST"])
@roles_required("admin", "presiding_officer")
def create_election():
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description", "")
    address_id = data.get("address_id")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    is_active = 1 if data.get("is_active") in (1, True, "1", "true") else 0

    if not all([title, address_id, start_date, end_date]):
        return jsonify({"error": "Title, Address, Start Date, and End Date are required."}), 400

    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            cursor.execute(
                """
                INSERT INTO elections (title, description, address_id, start_date, end_date, is_active)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (title, description, address_id, start_date, end_date, is_active),
            )
            election_id = cursor.lastrowid
            return jsonify({
                "message": "Election created successfully!",
                "id": election_id
            }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ------------------ Update Election ------------------
@elections_bp.route("/elections/<int:election_id>", methods=["PUT"])
@roles_required("admin", "presiding_officer")
def update_election(election_id):
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description", "")
    address_id = data.get("address_id")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    is_active = 1 if data.get("is_active") in (1, True, "1", "true") else 0

    if not all([title, address_id, start_date, end_date]):
        return jsonify({"error": "Title, Address, Start Date, and End Date are required."}), 400

    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            cursor.execute(
                """
                UPDATE elections
                SET title = %s, description = %s, address_id = %s, start_date = %s, end_date = %s, is_active = %s
                WHERE id = %s
                """,
                (title, description, address_id, start_date, end_date, is_active, election_id),
            )
            if cursor.rowcount == 0:
                return jsonify({"error": "Election not found or unchanged"}), 404
            return jsonify({"message": "Election updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ------------------ Toggle Election Status ------------------
@elections_bp.route("/elections/<int:election_id>/status", methods=["PATCH"])
@roles_required("admin", "presiding_officer")
def toggle_election_status(election_id):
    data = request.get_json() or {}
    is_active = 1 if data.get("is_active") in (1, True, "1", "true") else 0

    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            cursor.execute(
                "UPDATE elections SET is_active = %s WHERE id = %s",
                (is_active, election_id),
            )
            if cursor.rowcount == 0:
                return jsonify({"error": "Election not found"}), 404
            status_text = "activated" if is_active else "deactivated"
            return jsonify({"message": f"Election {status_text} successfully!", "is_active": bool(is_active)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ------------------ Delete Election ------------------
@elections_bp.route("/elections/<int:election_id>", methods=["DELETE"])
@roles_required("admin")
def delete_election(election_id):
    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            # Delete associated votes first
            cursor.execute("DELETE FROM votes WHERE election_id = %s", (election_id,))
            # Delete candidates
            cursor.execute("DELETE FROM candidates WHERE election_id = %s", (election_id,))
            # Delete election
            cursor.execute("DELETE FROM elections WHERE id = %s", (election_id,))
            if cursor.rowcount == 0:
                return jsonify({"error": "Election not found"}), 404
            return jsonify({"message": "Election and associated records deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
