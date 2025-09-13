from flask import Blueprint, request, jsonify, g, send_from_directory
from db_connections import get_db_connection
from functools import wraps
import jwt, os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")

UPLOAD_FOLDER = "uploads/symbols"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

candidates_bp = Blueprint("candidates", __name__)

# ---------------- Helper ----------------
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

# ---------------- Upload Symbol ----------------
@candidates_bp.route("/candidates/upload-symbol", methods=["POST"])
@token_required
def upload_symbol():
    if g.user_role not in ("admin", "presiding_officer"):
        return jsonify({"error": "Forbidden"}), 403
    if "symbol" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["symbol"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        return jsonify({"message": "Symbol uploaded", "filename": filename}), 201
    return jsonify({"error": "Invalid file type"}), 400

# ---------------- Serve Symbol ----------------
@candidates_bp.route("/uploads/symbols/<filename>")
def serve_symbol(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ---------------- Add Candidate ----------------
@candidates_bp.route("/candidates", methods=["POST"])
@token_required
def add_candidate():
    if g.user_role not in ("admin", "presiding_officer"):
        return jsonify({"error": "Forbidden"}), 403

    data = request.form
    user_id = data.get("user_id")
    election_id = data.get("election_id")
    party = data.get("party", "")
    slogan = data.get("slogan", "")
    file = request.files.get("symbol")
    symbol_filename = None

    if not user_id or not election_id:
        return jsonify({"error": "user_id and election_id are required"}), 400

    if file and allowed_file(file.filename):
        symbol_filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, symbol_filename))

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        sql = """
        INSERT INTO candidates (user_id, election_id, party, slogan, symbol)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (user_id, election_id, party, slogan, symbol_filename))
        conn.commit()
        new_id = cursor.lastrowid
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "Candidate added successfully", "id": new_id, "symbol": symbol_filename}), 201

# ---------------- Get All Candidates ----------------
@candidates_bp.route("/candidates", methods=["GET"])
def get_candidates():
    election_id = request.args.get("election_id")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        if election_id:
            cursor.execute("""
                SELECT c.id, c.election_id, c.party, c.slogan, c.symbol,
                       u.id AS user_id, u.username, u.first_name, u.last_name
                FROM candidates c
                JOIN users u ON c.user_id = u.id
                WHERE c.election_id = %s
            """, (election_id,))
        else:
            cursor.execute("""
                SELECT c.id, c.election_id, c.party, c.slogan, c.symbol,
                       u.id AS user_id, u.username, u.first_name, u.last_name
                FROM candidates c
                JOIN users u ON c.user_id = u.id
            """)

        candidates = cursor.fetchall()
        for c in candidates:
            c["symbol_url"] = f"/uploads/symbols/{c['symbol']}" if c["symbol"] else None
            c["name"] = f"{c['first_name']} {c['last_name']}"
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify(candidates)
