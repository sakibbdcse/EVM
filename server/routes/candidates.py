import os
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from db_connections import get_db_cursor
from middleware import roles_required, allowed_file
import config

candidates_bp = Blueprint("candidates", __name__)

# ------------------ Serve Candidate Symbol ------------------
@candidates_bp.route("/uploads/symbols/<filename>")
def serve_symbol(filename):
    file_path = os.path.join(config.SYMBOL_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "Symbol file not found"}), 404
    return send_from_directory(config.SYMBOL_FOLDER, filename)


# ------------------ Get All Candidates ------------------
@candidates_bp.route("/candidates", methods=["GET"])
def get_candidates():
    election_id = request.args.get("election_id")
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            query = """
                SELECT c.id, c.election_id, c.party, c.slogan, c.description, c.symbol,
                       u.id AS user_id, u.username, u.first_name, u.last_name, u.photo,
                       e.title AS election_title, e.is_active AS election_is_active,
                       (SELECT COUNT(*) FROM votes v WHERE v.candidate_id = c.id AND v.election_id = c.election_id) AS votes
                FROM candidates c
                JOIN users u ON c.user_id = u.id
                JOIN elections e ON c.election_id = e.id
            """
            params = []
            if election_id:
                query += " WHERE c.election_id = %s"
                params.append(election_id)

            query += " ORDER BY c.election_id DESC, votes DESC, c.id ASC"

            cursor.execute(query, tuple(params))
            candidates = cursor.fetchall()

            for c in candidates:
                c["symbol_url"] = f"/uploads/symbols/{c['symbol']}" if c["symbol"] else None
                c["photo_url"] = f"/user/uploads/profile/{c['photo']}" if c["photo"] else None
                c["name"] = f"{c['first_name']} {c['last_name']}"

            return jsonify(candidates), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Get Single Candidate ------------------
@candidates_bp.route("/candidates/<int:candidate_id>", methods=["GET"])
def get_candidate(candidate_id):
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            cursor.execute(
                """
                SELECT c.id, c.election_id, c.party, c.slogan, c.description, c.symbol,
                       u.id AS user_id, u.username, u.first_name, u.last_name, u.photo,
                       e.title AS election_title, e.is_active AS election_is_active,
                       (SELECT COUNT(*) FROM votes v WHERE v.candidate_id = c.id AND v.election_id = c.election_id) AS votes
                FROM candidates c
                JOIN users u ON c.user_id = u.id
                JOIN elections e ON c.election_id = e.id
                WHERE c.id = %s
                """,
                (candidate_id,),
            )
            c = cursor.fetchone()
            if not c:
                return jsonify({"error": "Candidate not found"}), 404

            c["symbol_url"] = f"/uploads/symbols/{c['symbol']}" if c["symbol"] else None
            c["photo_url"] = f"/user/uploads/profile/{c['photo']}" if c["photo"] else None
            c["name"] = f"{c['first_name']} {c['last_name']}"
            return jsonify(c), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Add Candidate ------------------
@candidates_bp.route("/candidates", methods=["POST"])
@roles_required("admin", "presiding_officer")
def add_candidate():
    # Handle either multipart form-data or JSON
    if request.form:
        user_id = request.form.get("user_id")
        election_id = request.form.get("election_id")
        party = request.form.get("party", "").strip()
        slogan = request.form.get("slogan", "").strip()
        description = request.form.get("description", "").strip()
    else:
        data = request.get_json() or {}
        user_id = data.get("user_id")
        election_id = data.get("election_id")
        party = data.get("party", "").strip()
        slogan = data.get("slogan", "").strip()
        description = data.get("description", "").strip()

    if not user_id or not election_id:
        return jsonify({"error": "user_id and election_id are required"}), 400

    symbol_filename = None
    file = request.files.get("symbol") if request.files else None
    if file and file.filename:
        if allowed_file(file.filename):
            symbol_filename = secure_filename(f"cand_{election_id}_{user_id}_{file.filename}")
            file.save(os.path.join(config.SYMBOL_FOLDER, symbol_filename))
        else:
            return jsonify({"error": "Invalid symbol image file format"}), 400

    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            # Check election exists
            cursor.execute("SELECT id FROM elections WHERE id = %s", (election_id,))
            if not cursor.fetchone():
                return jsonify({"error": "Specified election does not exist"}), 404

            # Check user exists
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return jsonify({"error": "Specified user does not exist"}), 404

            # Check duplicate nomination
            cursor.execute(
                "SELECT id FROM candidates WHERE election_id = %s AND user_id = %s",
                (election_id, user_id),
            )
            if cursor.fetchone():
                return jsonify({"error": "This user is already nominated as a candidate for this election"}), 409

            cursor.execute(
                """
                INSERT INTO candidates (user_id, election_id, party, slogan, description, symbol)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (user_id, election_id, party, slogan, description, symbol_filename),
            )
            candidate_id = cursor.lastrowid

            return jsonify({
                "message": "Candidate added successfully!",
                "id": candidate_id,
                "symbol": symbol_filename,
                "symbol_url": f"/uploads/symbols/{symbol_filename}" if symbol_filename else None
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Update Candidate ------------------
@candidates_bp.route("/candidates/<int:candidate_id>", methods=["PUT"])
@roles_required("admin", "presiding_officer")
def update_candidate(candidate_id):
    if request.form:
        party = request.form.get("party")
        slogan = request.form.get("slogan")
        description = request.form.get("description")
    else:
        data = request.get_json() or {}
        party = data.get("party")
        slogan = data.get("slogan")
        description = data.get("description")

    file = request.files.get("symbol") if request.files else None
    new_symbol = None
    if file and file.filename:
        if allowed_file(file.filename):
            new_symbol = secure_filename(f"cand_update_{candidate_id}_{file.filename}")
            file.save(os.path.join(config.SYMBOL_FOLDER, new_symbol))
        else:
            return jsonify({"error": "Invalid symbol image format"}), 400

    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            updates = []
            values = []
            if party is not None:
                updates.append("party = %s")
                values.append(party)
            if slogan is not None:
                updates.append("slogan = %s")
                values.append(slogan)
            if description is not None:
                updates.append("description = %s")
                values.append(description)
            if new_symbol is not None:
                updates.append("symbol = %s")
                values.append(new_symbol)

            if not updates:
                return jsonify({"error": "No fields provided to update"}), 400

            values.append(candidate_id)
            cursor.execute(
                f"UPDATE candidates SET {', '.join(updates)} WHERE id = %s",
                tuple(values),
            )
            if cursor.rowcount == 0:
                return jsonify({"error": "Candidate not found"}), 404

            return jsonify({"message": "Candidate updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Delete Candidate ------------------
@candidates_bp.route("/candidates/<int:candidate_id>", methods=["DELETE"])
@roles_required("admin", "presiding_officer")
def delete_candidate(candidate_id):
    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            # Delete votes cast for this candidate
            cursor.execute("DELETE FROM votes WHERE candidate_id = %s", (candidate_id,))
            cursor.execute("DELETE FROM candidates WHERE id = %s", (candidate_id,))
            if cursor.rowcount == 0:
                return jsonify({"error": "Candidate not found"}), 404
            return jsonify({"message": "Candidate and associated votes deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
