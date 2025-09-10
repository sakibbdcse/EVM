from flask import Blueprint, request, jsonify, g, send_from_directory
from db_connections import get_db_connection
from functools import wraps
import jwt
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")

# -------- Settings --------
UPLOAD_FOLDER = "uploads/symbols"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
BASE_URL = os.getenv("BASE_URL", "http://localhost:5000")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

candidates_bp = Blueprint("candidates", __name__)


# -------- Helpers --------
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


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


# -------- Serve Symbol --------
@candidates_bp.route("/uploads/symbols/<filename>")
def serve_symbol(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# -------- Get All Candidates --------
@candidates_bp.route("/candidates", methods=["GET"])
def get_candidates():
    election_id = request.args.get("election_id")

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    if election_id:
        cur.execute("SELECT * FROM candidates WHERE election_id = %s", (election_id,))
    else:
        cur.execute("SELECT * FROM candidates")

    rows = cur.fetchall()
    cur.close()
    conn.close()

    # Attach full symbol URL
    for row in rows:
        if row.get("symbol"):
            row["symbol_url"] = f"{BASE_URL}/uploads/symbols/{row['symbol']}"
        else:
            row["symbol_url"] = None

    return jsonify(rows), 200


# -------- Add Candidate --------
@candidates_bp.route("/candidates", methods=["POST"])
@token_required
def add_candidate():
    if g.user_role not in ("admin", "presiding_officer"):
        return jsonify({"error": "Forbidden"}), 403

    data = request.form
    file = request.files.get("symbol")
    symbol_filename = None

    if file and allowed_file(file.filename):
        symbol_filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, symbol_filename))

    conn = get_db_connection()
    cur = conn.cursor()

    sql = """
        INSERT INTO candidates (election_id, name, description, party, slogan, symbol)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    values = (
        data.get("election_id"),
        data.get("name"),
        data.get("description"),
        data.get("party"),
        data.get("slogan"),
        symbol_filename,
    )

    cur.execute(sql, values)
    conn.commit()
    new_id = cur.lastrowid
    cur.close()
    conn.close()

    return jsonify(
        {
            "message": "Candidate added successfully",
            "id": new_id,
            "symbol_url": f"{BASE_URL}/uploads/symbols/{symbol_filename}"
            if symbol_filename
            else None,
        }
    ), 201


# -------- Update Candidate --------
@candidates_bp.route("/candidates/<int:candidate_id>", methods=["PUT"])
@token_required
def update_candidate(candidate_id):
    if g.user_role not in ("admin", "presiding_officer"):
        return jsonify({"error": "Forbidden"}), 403

    data = request.form
    file = request.files.get("symbol")

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM candidates WHERE id = %s", (candidate_id,))
        existing = cur.fetchone()
        cur.close()

        if not existing:
            return jsonify({"error": "Candidate not found"}), 404

        # fallback logic
        name = data.get("name") or existing.get("name")
        description = data.get("description") or existing.get("description")
        party = data.get("party") or existing.get("party")
        slogan = data.get("slogan") or existing.get("slogan")

        symbol_filename = existing.get("symbol")
        if file and file.filename:
            if not allowed_file(file.filename):
                return jsonify({"error": "Invalid file type"}), 400

            new_filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, new_filename))

            old_symbol = existing.get("symbol")
            if old_symbol:
                old_path = os.path.join(UPLOAD_FOLDER, old_symbol)
                if os.path.exists(old_path) and old_symbol != new_filename:
                    try:
                        os.remove(old_path)
                    except Exception:
                        pass

            symbol_filename = new_filename

        cur2 = conn.cursor()
        update_sql = """
            UPDATE candidates
            SET name = %s, description = %s, party = %s, slogan = %s, symbol = %s
            WHERE id = %s
        """
        cur2.execute(
            update_sql, (name, description, party, slogan, symbol_filename, candidate_id)
        )
        conn.commit()
        cur2.close()

        cur3 = conn.cursor(dictionary=True)
        cur3.execute("SELECT * FROM candidates WHERE id = %s", (candidate_id,))
        updated = cur3.fetchone()
        cur3.close()

        if updated and updated.get("symbol"):
            updated["symbol_url"] = f"{BASE_URL}/uploads/symbols/{updated['symbol']}"

        return jsonify(
            {"message": "Candidate updated successfully", "candidate": updated}
        ), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


# -------- Delete Candidate --------
@candidates_bp.route("/candidates/<int:candidate_id>", methods=["DELETE"])
@token_required
def delete_candidate(candidate_id):
    if g.user_role not in ("admin", "presiding_officer"):
        return jsonify({"error": "Forbidden"}), 403

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("SELECT * FROM candidates WHERE id = %s", (candidate_id,))
    candidate = cur.fetchone()

    if not candidate:
        cur.close()
        conn.close()
        return jsonify({"error": "Candidate not found"}), 404

    # delete from DB
    cur.execute("DELETE FROM candidates WHERE id = %s", (candidate_id,))
    conn.commit()
    cur.close()
    conn.close()

    # delete symbol file
    if candidate.get("symbol"):
        file_path = os.path.join(UPLOAD_FOLDER, candidate["symbol"])
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

    return jsonify({"message": "Candidate deleted successfully"}), 200
