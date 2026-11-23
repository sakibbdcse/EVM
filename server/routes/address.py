from flask import Blueprint, request, jsonify
from db_connections import get_db_cursor
from middleware import roles_required

address_bp = Blueprint("address", __name__)

# ------------------ Get All Addresses ------------------
@address_bp.route("/addresses", methods=["GET"])
def get_addresses():
    division = request.args.get("division")
    district = request.args.get("district")
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            query = "SELECT * FROM addresses"
            params = []
            conditions = []
            if division:
                conditions.append("division = %s")
                params.append(division)
            if district:
                conditions.append("district = %s")
                params.append(district)

            if conditions:
                query += " WHERE " + " AND ".join(conditions)

            query += " ORDER BY division ASC, district ASC, city ASC"
            cursor.execute(query, tuple(params))
            addresses = cursor.fetchall()
            return jsonify(addresses), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Get Single Address ------------------
@address_bp.route("/addresses/<int:address_id>", methods=["GET"])
def get_address(address_id):
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            cursor.execute("SELECT * FROM addresses WHERE id = %s", (address_id,))
            address = cursor.fetchone()
            if address:
                return jsonify(address), 200
            return jsonify({"error": "Address not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Create Address ------------------
@address_bp.route("/addresses", methods=["POST"])
@roles_required("admin", "presiding_officer")
def create_address():
    data = request.get_json() or {}
    division = (data.get("division") or "").strip()
    district = (data.get("district") or "").strip()
    city = (data.get("city") or "").strip()
    village = (data.get("village") or "").strip()
    other_address_details = (data.get("other_address_details") or "").strip()

    if not division or not district:
        return jsonify({"error": "Division and District are required"}), 400

    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            sql = """
                INSERT INTO addresses (division, district, city, village, other_address_details)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (division, district, city or None, village or None, other_address_details or None))
            return jsonify({"message": "Address created successfully", "id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ------------------ Update Address ------------------
@address_bp.route("/addresses/<int:address_id>", methods=["PUT"])
@roles_required("admin", "presiding_officer")
def update_address(address_id):
    data = request.get_json() or {}
    division = data.get("division")
    district = data.get("district")
    city = data.get("city")
    village = data.get("village")
    other_address_details = data.get("other_address_details")

    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            sql = """
                UPDATE addresses
                SET division = %s, district = %s, city = %s, village = %s, other_address_details = %s
                WHERE id = %s
            """
            cursor.execute(sql, (division, district, city, village, other_address_details, address_id))
            if cursor.rowcount == 0:
                return jsonify({"error": "Address not found"}), 404
            return jsonify({"message": "Address updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ------------------ Delete Address ------------------
@address_bp.route("/addresses/<int:address_id>", methods=["DELETE"])
@roles_required("admin")
def delete_address(address_id):
    try:
        with get_db_cursor(commit=True) as (conn, cursor):
            cursor.execute("DELETE FROM addresses WHERE id = %s", (address_id,))
            if cursor.rowcount == 0:
                return jsonify({"error": "Address not found"}), 404
            return jsonify({"message": "Address deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
