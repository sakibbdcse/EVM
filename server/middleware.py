from functools import wraps
from flask import request, jsonify, g
import jwt
import config

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = None
        if header.startswith("Bearer "):
            token = header.split(" ", 1)[1].strip()
        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401

        try:
            payload = jwt.decode(token, config.SECRET_KEY, algorithms=["HS256"])
            g.user_id = payload.get("user_id")
            g.user_role = payload.get("role")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Authentication token has expired. Please log in again."}), 401
        except Exception:
            return jsonify({"error": "Invalid authentication token"}), 401

        return f(*args, **kwargs)
    return decorated

def roles_required(*allowed_roles):
    """
    Decorator to restrict access to specific roles.
    'super_admin' is always granted access if any administrative role is allowed.
    """
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            user_role = getattr(g, "user_role", None)
            if not user_role:
                return jsonify({"error": "Forbidden: No role found"}), 403

            # super_admin has top-level privileges
            if user_role == "super_admin":
                return f(*args, **kwargs)

            if user_role not in allowed_roles:
                return jsonify({"error": f"Forbidden: Access restricted to {', '.join(allowed_roles)}"}), 403

            return f(*args, **kwargs)
        return decorated
    return decorator
