from flask import Blueprint, request, jsonify
from db_connections import get_db_connection

address_bp = Blueprint("address", __name__)

# ------------------ Create Address ------------------
@address_bp.route("/addresses", methods=["POST"])
def create_address():
    data = request.get_json()
    division = data.get("division")
    district = data.get("district")
    city = data.get("city")
    village = data.get("village")
    other_address_details = data.get("other_address_details")

    if not division or not district:
        return jsonify({"error": "Division and District are required"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    sql = """
        INSERT INTO addresses (division, district, city, village, other_address_details)
        VALUES (%s, %s, %s, %s, %s)
    """
    try:
        cursor.execute(sql, (division, district, city, village, other_address_details))
        conn.commit()
        return jsonify({"message": "Address created successfully", "id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# ------------------ Get All Addresses ------------------
@address_bp.route("/addresses", methods=["GET"])
def get_addresses():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM addresses ORDER BY id DESC")
        addresses = cursor.fetchall()
        return jsonify(addresses), 200
    finally:
        cursor.close()
        conn.close()


# ------------------ Get Single Address ------------------
@address_bp.route("/addresses/<int:address_id>", methods=["GET"])
def get_address(address_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM addresses WHERE id = %s", (address_id,))
        address = cursor.fetchone()
        if address:
            return jsonify(address), 200
        return jsonify({"error": "Address not found"}), 404
    finally:
        cursor.close()
        conn.close()


# ------------------ Update Address ------------------
@address_bp.route("/addresses/<int:address_id>", methods=["PUT"])
def update_address(address_id):
    data = request.get_json()

    division = data.get("division")
    district = data.get("district")
    city = data.get("city")
    village = data.get("village")
    other_address_details = data.get("other_address_details")

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        sql = """
            UPDATE addresses
            SET division = %s, district = %s, city = %s, village = %s, other_address_details = %s
            WHERE id = %s
        """
        cursor.execute(sql, (division, district, city, village, other_address_details, address_id))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Address not found"}), 404
        return jsonify({"message": "Address updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# ------------------ Delete Address ------------------
@address_bp.route("/addresses/<int:address_id>", methods=["DELETE"])
def delete_address(address_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM addresses WHERE id = %s", (address_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Address not found"}), 404
        return jsonify({"message": "Address deleted successfully"}), 200
    finally:
        cursor.close()
        conn.close()
