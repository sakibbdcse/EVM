from flask import Blueprint, request, jsonify, g
from datetime import datetime
from db_connections import get_db_cursor
from middleware import token_required
import config

votes_bp = Blueprint("votes", __name__)

# ------------------ Cast a Vote ------------------
@votes_bp.route("/elections/<int:election_id>/vote", methods=["POST"])
@token_required
def cast_vote(election_id):
    voter_id = g.user_id
    data = request.get_json() or {}
    candidate_id = data.get("candidate_id")

    if not candidate_id:
        return jsonify({"error": "Candidate ID is required to cast a vote."}), 400

    try:
        with get_db_cursor(dictionary=True, commit=True) as (conn, cursor):
            # 1. Fetch Election details
            cursor.execute(
                """
                SELECT id, title, start_date, end_date, is_active
                FROM elections
                WHERE id = %s
                """,
                (election_id,),
            )
            election = cursor.fetchone()
            if not election:
                return jsonify({"error": "Election not found."}), 404

            if not election["is_active"]:
                return jsonify({"error": "This election is currently inactive."}), 400

            now = datetime.now()
            if election["start_date"] and now < election["start_date"]:
                return jsonify({
                    "error": f"Voting has not started yet. Starts at {election['start_date']}."
                }), 400

            if election["end_date"] and now > election["end_date"]:
                return jsonify({
                    "error": f"Voting has ended for this election. Closed at {election['end_date']}."
                }), 400

            # 2. Check if user has already voted in this specific election
            cursor.execute(
                "SELECT id FROM votes WHERE voter_id = %s AND election_id = %s",
                (voter_id, election_id),
            )
            existing_vote = cursor.fetchone()
            if existing_vote:
                return jsonify({"error": "You have already cast your vote in this election."}), 409

            # 3. Validate Candidate belongs to this election
            cursor.execute(
                """
                SELECT c.id, c.party, c.slogan, u.first_name, u.last_name
                FROM candidates c
                JOIN users u ON c.user_id = u.id
                WHERE c.id = %s AND c.election_id = %s
                """,
                (candidate_id, election_id),
            )
            candidate = cursor.fetchone()
            if not candidate:
                return jsonify({"error": "Selected candidate does not belong to this election."}), 400

            # 4. Insert Vote Record
            cursor.execute(
                """
                INSERT INTO votes (voter_id, election_id, candidate_id, timestamp)
                VALUES (%s, %s, %s, NOW())
                """,
                (voter_id, election_id, candidate_id),
            )
            vote_id = cursor.lastrowid

            # 5. Update user's has_voted flag
            cursor.execute(
                "UPDATE users SET has_voted = 1 WHERE id = %s",
                (voter_id,),
            )

            return jsonify({
                "message": f"Vote cast successfully for {candidate['first_name']} {candidate['last_name']} ({candidate['party']})!",
                "vote_id": vote_id,
                "election_id": election_id,
                "candidate_id": candidate_id,
                "timestamp": now.isoformat()
            }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Check User Vote Status for Election ------------------
@votes_bp.route("/elections/<int:election_id>/vote-status", methods=["GET"])
@token_required
def get_vote_status(election_id):
    voter_id = g.user_id
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            cursor.execute(
                """
                SELECT v.id, v.candidate_id, v.timestamp,
                       c.party, c.symbol, u.first_name, u.last_name
                FROM votes v
                JOIN candidates c ON v.candidate_id = c.id
                JOIN users u ON c.user_id = u.id
                WHERE v.voter_id = %s AND v.election_id = %s
                """,
                (voter_id, election_id),
            )
            vote = cursor.fetchone()
            if vote:
                return jsonify({
                    "has_voted": True,
                    "vote": {
                        "vote_id": vote["id"],
                        "candidate_id": vote["candidate_id"],
                        "candidate_name": f"{vote['first_name']} {vote['last_name']}",
                        "party": vote["party"],
                        "symbol_url": f"/uploads/symbols/{vote['symbol']}" if vote["symbol"] else None,
                        "timestamp": vote["timestamp"].isoformat() if vote["timestamp"] else None,
                    }
                }), 200
            else:
                return jsonify({"has_voted": False, "vote": None}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ Election Results ------------------
@votes_bp.route("/elections/<int:election_id>/results", methods=["GET"])
def get_election_results(election_id):
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            # Fetch election info
            cursor.execute(
                """
                SELECT e.*, a.division, a.district, a.city
                FROM elections e
                LEFT JOIN addresses a ON e.address_id = a.id
                WHERE e.id = %s
                """,
                (election_id,),
            )
            election = cursor.fetchone()
            if not election:
                return jsonify({"error": "Election not found"}), 404

            # Total votes cast
            cursor.execute(
                "SELECT COUNT(*) AS total_votes FROM votes WHERE election_id = %s",
                (election_id,),
            )
            total_votes_res = cursor.fetchone()
            total_votes = total_votes_res["total_votes"] if total_votes_res else 0

            # Votes per candidate
            cursor.execute(
                """
                SELECT c.id, c.election_id, c.party, c.slogan, c.symbol,
                       u.id AS user_id, u.username, u.first_name, u.last_name, u.photo,
                       COUNT(v.id) AS vote_count
                FROM candidates c
                JOIN users u ON c.user_id = u.id
                LEFT JOIN votes v ON c.id = v.candidate_id AND v.election_id = %s
                WHERE c.election_id = %s
                GROUP BY c.id
                ORDER BY vote_count DESC, c.id ASC
                """,
                (election_id, election_id),
            )
            candidate_rows = cursor.fetchall()

            candidates_data = []
            for c in candidate_rows:
                v_count = c["vote_count"]
                pct = round((v_count / total_votes * 100), 2) if total_votes > 0 else 0.0
                candidates_data.append({
                    "id": c["id"],
                    "election_id": c["election_id"],
                    "user_id": c["user_id"],
                    "name": f"{c['first_name']} {c['last_name']}",
                    "username": c["username"],
                    "party": c["party"] or "",
                    "slogan": c["slogan"] or "",
                    "symbol": c["symbol"],
                    "symbol_url": f"/uploads/symbols/{c['symbol']}" if c["symbol"] else None,
                    "photo_url": f"/user/uploads/profile/{c['photo']}" if c["photo"] else None,
                    "votes": v_count,
                    "percentage": pct
                })

            now = datetime.now()
            status = "ongoing"
            if not election["is_active"]:
                status = "inactive"
            elif election["start_date"] and now < election["start_date"]:
                status = "upcoming"
            elif election["end_date"] and now > election["end_date"]:
                status = "ended"

            winner = None
            if len(candidates_data) > 0 and total_votes > 0:
                top_candidate = candidates_data[0]
                # check if there's a tie
                if len(candidates_data) > 1 and candidates_data[0]["votes"] == candidates_data[1]["votes"]:
                    winner = {
                        "status": "tie",
                        "top_votes": top_candidate["votes"],
                        "candidates": [c["name"] for c in candidates_data if c["votes"] == top_candidate["votes"]]
                    }
                else:
                    winner = {
                        "status": "clear_lead" if status == "ongoing" else "won",
                        "candidate_id": top_candidate["id"],
                        "name": top_candidate["name"],
                        "party": top_candidate["party"],
                        "votes": top_candidate["votes"],
                        "percentage": top_candidate["percentage"]
                    }

            return jsonify({
                "election": {
                    "id": election["id"],
                    "title": election["title"],
                    "description": election.get("description", ""),
                    "start_date": election["start_date"].isoformat() if election["start_date"] else None,
                    "end_date": election["end_date"].isoformat() if election["end_date"] else None,
                    "is_active": bool(election["is_active"]),
                    "status": status,
                    "location": f"{election.get('division', '')}, {election.get('district', '')}"
                },
                "total_votes": total_votes,
                "winner": winner,
                "candidates": candidates_data
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ System Statistics Overview ------------------
@votes_bp.route("/stats/overview", methods=["GET"])
def get_system_overview():
    try:
        with get_db_cursor(dictionary=True) as (conn, cursor):
            cursor.execute("SELECT COUNT(*) AS total_elections FROM elections")
            total_elections = cursor.fetchone()["total_elections"]

            cursor.execute("SELECT COUNT(*) AS active_elections FROM elections WHERE is_active = 1")
            active_elections = cursor.fetchone()["active_elections"]

            cursor.execute("SELECT COUNT(*) AS total_users FROM users")
            total_users = cursor.fetchone()["total_users"]

            cursor.execute("SELECT COUNT(*) AS total_voters FROM users WHERE role = 'voter'")
            total_voters = cursor.fetchone()["total_voters"]

            cursor.execute("SELECT COUNT(*) AS total_candidates FROM candidates")
            total_candidates = cursor.fetchone()["total_candidates"]

            cursor.execute("SELECT COUNT(*) AS total_votes FROM votes")
            total_votes = cursor.fetchone()["total_votes"]

            return jsonify({
                "total_elections": total_elections,
                "active_elections": active_elections,
                "total_users": total_users,
                "total_voters": total_voters,
                "total_candidates": total_candidates,
                "total_votes": total_votes,
            }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
