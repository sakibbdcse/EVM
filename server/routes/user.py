import os
from flask import Blueprint, request, jsonify, send_from_directory, g
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash
from datetime import date, datetime
from db_connections import get_db_cursor
from middleware import token_required, roles_required, allowed_file
import config

user_bp = Blueprint("user", __name__)

def format_date(value):
    if isinstance(value, (date, datetime)):
        return value.strftime("%Y-%m-%d")
    return value


# ------------------ Serve Uploaded Profile Photos ------------------
@user_bp.route("/uploads/profile/<filename>")
def uploaded_profile_file(filename):
    file_path = os.path.join(config.PROFILE_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "Profile image not found"}), 404
    return send_from_directory(config.PROFILE_FOLDER, filename)


# ------------------ Get Current Logged In User ------------------
@user_bp.route("/current-user", methods=["GET"])
@token_required
def current_user():
    user_id = g.user_id
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            cursor.execute(
                """
                SELECT u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
                       u.gender, u.birthdate, u.nid, u.role, u.has_voted, u.address_id, u.photo,
                       a.division, a.district, a.city, a.village, a.other_address_details
                FROM users u
                LEFT JOIN addresses a ON u.address_id = a.id
                WHERE u.id = %s
                """,
                (user_id,),
            )
            user = cursor.fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404

            address_info = None
            if user["address_id"]:
                address_info = {
                    "id": user["address_id"],
                    "division": user["division"],
                    "district": user["district"],
                    "city": user["city"],
                    "village": user["village"],
                    "other_address_details": user["other_address_details"]
                }

            return jsonify({
                "id": user["id"],
                "username": user["username"],
                "first_name": user["first_name"] or "",
                "last_name": user["last_name"] or "",
                "email": user["email"] or "",
                "phone": user["phone"] or "",
                "gender": user["gender"] or "Other",
                "birthdate": format_date(user["birthdate"]),
                "nid": user["nid"] or "",
                "role": user["role"],
                "has_voted": bool(user["has_voted"]),
                "address_id": user["address_id"],
                "address": address_info,
                "photo": user["photo"],
                "photo_url": f"/user/uploads/profile/{user['photo']}" if user["photo"] else None
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Get All Users (Admin / Presiding Officer) ------------------
@user_bp.route("/all", methods=["GET"])
@roles_required("admin", "presiding_officer")
def get_all_users():
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            cursor.execute(
                """
                SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.gender,
                       u.birthdate, u.nid, u.role, u.has_voted, u.date_joined, u.address_id, u.photo,
                       a.division, a.district, a.city, a.village
                FROM users u
                LEFT JOIN addresses a ON u.address_id = a.id
                ORDER BY u.id DESC
                """
            )
            users = cursor.fetchall()

            return jsonify([
                {
                    "id": u["id"],
                    "username": u["username"],
                    "email": u["email"],
                    "first_name": u["first_name"] or "",
                    "last_name": u["last_name"] or "",
                    "phone": u["phone"] or "",
                    "gender": u["gender"] or "Other",
                    "birthdate": format_date(u["birthdate"]),
                    "nid": u["nid"] or "",
                    "role": u["role"],
                    "has_voted": bool(u["has_voted"]),
                    "date_joined": format_date(u["date_joined"]),
                    "address_id": u["address_id"],
                    "address_label": f"{u['division']}, {u['district']}" if u["division"] else "N/A",
                    "photo": u["photo"],
                    "photo_url": f"/user/uploads/profile/{u['photo']}" if u["photo"] else None
                }
                for u in users
            ]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Get Single User ------------------
@user_bp.route("/<int:user_id>", methods=["GET"])
@token_required
def get_user(user_id):
    # Only allow self, presiding_officer, admin, or super_admin
    if g.user_role not in ("admin", "presiding_officer", "super_admin") and g.user_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            cursor.execute(
                """
                SELECT u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
                       u.gender, u.birthdate, u.nid, u.role, u.has_voted, u.address_id, u.photo,
                       a.division, a.district, a.city, a.village, a.other_address_details
                FROM users u
                LEFT JOIN addresses a ON u.address_id = a.id
                WHERE u.id = %s
                """,
                (user_id,),
            )
            user = cursor.fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404

            address_info = None
            if user["address_id"]:
                address_info = {
                    "id": user["address_id"],
                    "division": user["division"],
                    "district": user["district"],
                    "city": user["city"],
                    "village": user["village"],
                    "other_address_details": user["other_address_details"]
                }

            return jsonify({
                "id": user["id"],
                "username": user["username"],
                "first_name": user["first_name"] or "",
                "last_name": user["last_name"] or "",
                "email": user["email"] or "",
                "phone": user["phone"] or "",
                "gender": user["gender"] or "Other",
                "birthdate": format_date(user["birthdate"]),
                "nid": user["nid"] or "",
                "role": user["role"],
                "has_voted": bool(user["has_voted"]),
                "address_id": user["address_id"],
                "address": address_info,
                "photo": user["photo"],
                "photo_url": f"/user/uploads/profile/{user['photo']}" if user["photo"] else None
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Edit User Profile ------------------
@user_bp.route("/edit/<int:user_id>", methods=["PUT"])
@token_required
def edit_user(user_id):
    if g.user_role not in ("admin", "super_admin") and g.user_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    body = request.form.to_dict() if request.form else (request.get_json() or {})
    file = request.files.get("photo") if request.files else None

    if file and file.filename:
        if allowed_file(file.filename):
            filename = secure_filename(f"user_{user_id}_{file.filename}")
            file_path = os.path.join(config.PROFILE_FOLDER, filename)
            file.save(file_path)
            body["photo"] = filename
        else:
            return jsonify({"error": "Invalid photo file format"}), 400

    allowed_fields = [
        "first_name", "last_name", "phone", "gender",
        "birthdate", "nid", "address_id", "photo"
    ]
    # Admin can also edit email, username, and role
    if g.user_role in ("admin", "super_admin"):
        allowed_fields.extend(["username", "email", "role"])

    updates = []
    values = []
    for field in allowed_fields:
        if field in body and body[field] is not None:
            val = body[field]
            if field == "address_id" and val == "":
                val = None
            elif field == "gender" and val:
                val = val.capitalize()
            updates.append(f"{field} = %s")
            values.append(val)

    if not updates:
        return jsonify({"error": "No valid fields provided to update"}), 400

    values.append(user_id)

    try:
        with get_db_cursor(dictionary=True, commit=True) as (conn, cursor):
            cursor.execute(
                f"UPDATE users SET {', '.join(updates)} WHERE id = %s",
                tuple(values),
            )

            cursor.execute(
                """
                SELECT u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
                       u.gender, u.birthdate, u.nid, u.role, u.has_voted, u.address_id, u.photo,
                       a.division, a.district, a.city, a.village, a.other_address_details
                FROM users u
                LEFT JOIN addresses a ON u.address_id = a.id
                WHERE u.id = %s
                """,
                (user_id,),
            )
            updated = cursor.fetchone()
            if not updated:
                return jsonify({"error": "User not found"}), 404

            address_info = None
            if updated["address_id"]:
                address_info = {
                    "id": updated["address_id"],
                    "division": updated["division"],
                    "district": updated["district"],
                    "city": updated["city"],
                    "village": updated["village"],
                    "other_address_details": updated["other_address_details"]
                }

            return jsonify({
                "message": "Profile updated successfully!",
                "id": updated["id"],
                "username": updated["username"],
                "first_name": updated["first_name"] or "",
                "last_name": updated["last_name"] or "",
                "email": updated["email"] or "",
                "phone": updated["phone"] or "",
                "gender": updated["gender"] or "Other",
                "birthdate": format_date(updated["birthdate"]),
                "nid": updated["nid"] or "",
                "role": updated["role"],
                "has_voted": bool(updated["has_voted"]),
                "address_id": updated["address_id"],
                "address": address_info,
                "photo": updated["photo"],
                "photo_url": f"/user/uploads/profile/{updated['photo']}" if updated["photo"] else None
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ------------------ Update User Role (Admin / Super Admin Only) ------------------
@user_bp.route("/<int:user_id>/role", methods=["PATCH"])
@roles_required("admin", "super_admin")
def change_user_role(user_id):
    data = request.get_json() or {}
    new_role = data.get("role")
    valid_roles = ("voter", "presiding_officer", "admin", "super_admin")

    if new_role not in valid_roles:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400

    # Only super_admin can grant or revoke super_admin role
    if (new_role == "super_admin" or user_id == g.user_id) and g.user_role != "super_admin":
        return jsonify({"error": "Only a Super Administrator can assign or modify Super Admin privileges."}), 403

    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            cursor.execute("UPDATE users SET role = %s WHERE id = %s", (new_role, user_id))
            if cursor.rowcount == 0:
                return jsonify({"error": "User not found"}), 404
            return jsonify({"message": f"User role updated to '{new_role}' successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ------------------ Create Officer / Admin User Directly ------------------
@user_bp.route("/create", methods=["POST"])
@roles_required("admin", "super_admin")
def create_staff_user():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or "Password123!"
    email = (data.get("email") or "").strip()
    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    phone = (data.get("phone") or "").strip()
    role = data.get("role", "presiding_officer")
    address_id = data.get("address_id")

    if not all([username, email, first_name, last_name, phone]):
        return jsonify({"error": "Username, email, first name, last name, and phone are required."}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            cursor.execute(
                """
                INSERT INTO users (username, password, email, first_name, last_name, phone, role, date_joined, has_voted, address_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), 0, %s)
                """,
                (username, hashed_password, email, first_name, last_name, phone, role, address_id or None),
            )
            return jsonify({"message": f"{role.capitalize()} user created successfully!", "id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ------------------ Delete User ------------------
@user_bp.route("/delete/<int:user_id>", methods=["DELETE"])
@user_bp.route("/<int:user_id>", methods=["DELETE"])
@roles_required("admin")
def delete_user(user_id):
    if user_id == g.user_id:
        return jsonify({"error": "You cannot delete your own account."}), 400

    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            # Check if user is super_admin
            cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
            target = cursor.fetchone()
            if not target:
                return jsonify({"error": "User not found"}), 404
            if target[0] == "super_admin" and g.user_role != "super_admin":
                return jsonify({"error": "Only a Super Admin can delete a Super Admin account."}), 403

            # Delete any votes cast by this user
            cursor.execute("DELETE FROM votes WHERE voter_id = %s", (user_id,))
            # Delete any candidate record for this user
            cursor.execute("DELETE FROM candidates WHERE user_id = %s", (user_id,))
            # Delete user
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            return jsonify({"message": "User deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
