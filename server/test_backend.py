import unittest
import json
from app import app
from db_connections import get_db_cursor

class BackendIntegrationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()

    def login(self, login_id, password="Password123!"):
        res = self.client.post("/auth/login", json={
            "login_id": login_id,
            "password": password
        })
        self.assertEqual(res.status_code, 200, f"Failed login for {login_id}: {res.get_json()}")
        data = res.get_json()
        return data["token"], data["user"]

    def test_01_health_and_root(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("system", res.get_json())

        res2 = self.client.get("/health")
        self.assertEqual(res2.status_code, 200)

    def test_02_auth_logins_all_roles(self):
        roles = ["superadmin", "admin", "officer", "voter1"]
        for role in roles:
            token, user = self.login(role)
            self.assertIsNotNone(token)
            self.assertIsNotNone(user["id"])

    def test_03_active_election_and_list(self):
        res = self.client.get("/elections/active")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["id"], 10)
        self.assertTrue(data["is_active"])

        res2 = self.client.get("/elections")
        self.assertEqual(res2.status_code, 200)
        elections = res2.get_json()
        self.assertGreaterEqual(len(elections), 1)

    def test_04_candidates_list(self):
        res = self.client.get("/candidates?election_id=10")
        self.assertEqual(res.status_code, 200)
        candidates = res.get_json()
        self.assertGreaterEqual(len(candidates), 2)
        for c in candidates:
            self.assertIn("votes", c)
            self.assertIn("name", c)

    def test_05_voting_workflow_and_results(self):
        token_voter1, user_voter1 = self.login("voter1")
        headers = {"Authorization": f"Bearer {token_voter1}"}

        # Clear any existing votes by voter1 in election 10 for idempotent test
        with app.app_context():
            with get_db_cursor(commit=True) as (conn, cursor):
                cursor.execute("DELETE FROM votes WHERE voter_id = %s AND election_id = 10", (user_voter1["id"],))

        # Check initial vote status
        res_status = self.client.get("/elections/10/vote-status", headers=headers)
        self.assertEqual(res_status.status_code, 200)
        self.assertFalse(res_status.get_json()["has_voted"])

        # Cast vote for candidate 10
        res_vote = self.client.post("/elections/10/vote", headers=headers, json={"candidate_id": 10})
        self.assertEqual(res_vote.status_code, 201)
        self.assertIn("Vote cast successfully", res_vote.get_json()["message"])

        # Attempt to vote again (must be prevented with 409 conflict)
        res_duplicate = self.client.post("/elections/10/vote", headers=headers, json={"candidate_id": 11})
        self.assertEqual(res_duplicate.status_code, 409)

        # Check updated vote status
        res_status2 = self.client.get("/elections/10/vote-status", headers=headers)
        self.assertEqual(res_status2.status_code, 200)
        self.assertTrue(res_status2.get_json()["has_voted"])
        self.assertEqual(res_status2.get_json()["vote"]["candidate_id"], 10)

        # Check election results
        res_results = self.client.get("/elections/10/results")
        self.assertEqual(res_results.status_code, 200)
        results = res_results.get_json()
        self.assertGreaterEqual(results["total_votes"], 1)
        self.assertIsNotNone(results["winner"])

    def test_06_current_user_and_edit_profile(self):
        token, user = self.login("voter1")
        headers = {"Authorization": f"Bearer {token}"}

        res = self.client.get("/user/current-user", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["username"], "voter1")

        # Edit profile
        res_edit = self.client.put(f"/user/edit/{user['id']}", headers=headers, json={
            "first_name": "Rahimuddin",
            "last_name": "Khan"
        })
        self.assertEqual(res_edit.status_code, 200)
        self.assertEqual(res_edit.get_json()["first_name"], "Rahimuddin")

    def test_07_stats_overview(self):
        res = self.client.get("/stats/overview")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("total_elections", data)
        self.assertIn("total_votes", data)
        self.assertIn("total_voters", data)

    def test_08_election_lifecycle(self):
        token_admin, _ = self.login("admin")
        headers = {"Authorization": f"Bearer {token_admin}"}

        # Create election
        create_res = self.client.post("/elections", headers=headers, json={
            "title": "Automated Test Municipal Election",
            "description": "Integration test created election",
            "address_id": 1,
            "start_date": "2026-11-01T08:00:00",
            "end_date": "2026-11-30T18:00:00",
            "is_active": 0
        })
        self.assertEqual(create_res.status_code, 201)
        election_id = create_res.get_json()["id"]

        # Toggle status
        toggle_res = self.client.patch(f"/elections/{election_id}/status", headers=headers, json={"is_active": 1})
        self.assertEqual(toggle_res.status_code, 200)

        # Update election
        update_res = self.client.put(f"/elections/{election_id}", headers=headers, json={
            "title": "Automated Test Municipal Election (Updated)",
            "description": "Updated description",
            "address_id": 1,
            "start_date": "2026-11-01T08:00:00",
            "end_date": "2026-11-30T18:00:00",
            "is_active": 1
        })
        self.assertEqual(update_res.status_code, 200)

        # Delete election
        delete_res = self.client.delete(f"/elections/{election_id}", headers=headers)
        self.assertEqual(delete_res.status_code, 200)

    def test_09_address_crud(self):
        token_admin, _ = self.login("admin")
        headers = {"Authorization": f"Bearer {token_admin}"}

        # Create address
        res_create = self.client.post("/addresses", headers=headers, json={
            "division": "Dhaka",
            "district": "Dhaka",
            "city": "Uttara",
            "village": "Sector 3",
            "other_address_details": "Road 5"
        })
        self.assertEqual(res_create.status_code, 201)
        addr_id = res_create.get_json()["id"]

        # Get address
        res_get = self.client.get(f"/addresses/{addr_id}")
        self.assertEqual(res_get.status_code, 200)
        self.assertEqual(res_get.get_json()["city"], "Uttara")

        # Delete address
        res_del = self.client.delete(f"/addresses/{addr_id}", headers=headers)
        self.assertEqual(res_del.status_code, 200)

if __name__ == "__main__":
    unittest.main()
