import unittest
from app import app
from db_connections import get_db_cursor

class EndToEndEVMWorkflowTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()

        # Clean up any previous test user
        with app.app_context():
            with get_db_cursor(commit=True) as (conn, cursor):
                cursor.execute("SELECT id FROM users WHERE username = 'e2e_voter'")
                row = cursor.fetchone()
                if row:
                    user_id = row[0]
                    cursor.execute("DELETE FROM votes WHERE voter_id = %s", (user_id,))
                    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))

    def test_complete_voting_and_governance_lifecycle(self):
        # 1. Citizen Registration
        reg_payload = {
            "username": "e2e_voter",
            "password": "Password123!",
            "email": "e2e_voter@evm.com",
            "firstName": "Tahmid",
            "lastName": "Hasan",
            "phone": "01799999999",
            "gender": "Male",
            "nid": "NID_E2E_999999",
            "birthdate": "1994-06-15",
            "address_id": 1
        }
        res_reg = self.client.post("/auth/register", json=reg_payload)
        self.assertEqual(res_reg.status_code, 201)
        voter_id = res_reg.get_json()["user_id"]

        # 2. Citizen Login
        res_login = self.client.post("/auth/login", json={
            "login_id": "e2e_voter",
            "password": "Password123!"
        })
        self.assertEqual(res_login.status_code, 200)
        voter_token = res_login.get_json()["token"]
        voter_headers = {"Authorization": f"Bearer {voter_token}"}

        # 3. Discover Active Election and Candidates
        res_active = self.client.get("/elections/active")
        self.assertEqual(res_active.status_code, 200)
        election_data = res_active.get_json()
        election_id = election_data["id"]

        res_candidates = self.client.get(f"/candidates?election_id={election_id}")
        self.assertEqual(res_candidates.status_code, 200)
        candidates = res_candidates.get_json()
        self.assertGreaterEqual(len(candidates), 2)
        chosen_candidate_id = candidates[0]["id"]
        other_candidate_id = candidates[1]["id"]
        initial_votes = candidates[0]["votes"]

        # 4. Check Vote Status Before Voting
        res_status = self.client.get(f"/elections/{election_id}/vote-status", headers=voter_headers)
        self.assertEqual(res_status.status_code, 200)
        self.assertFalse(res_status.get_json()["has_voted"])

        # 5. Cast Ballot
        res_cast = self.client.post(f"/elections/{election_id}/vote", headers=voter_headers, json={
            "candidate_id": chosen_candidate_id
        })
        self.assertEqual(res_cast.status_code, 201)
        self.assertIn("Vote cast successfully", res_cast.get_json()["message"])

        # 6. Verify Double-Voting Prevention (409 Conflict)
        res_double_vote = self.client.post(f"/elections/{election_id}/vote", headers=voter_headers, json={
            "candidate_id": other_candidate_id
        })
        self.assertEqual(res_double_vote.status_code, 409)
        self.assertIn("already cast your vote", res_double_vote.get_json()["error"])

        # 7. Check Vote Status After Voting
        res_status_after = self.client.get(f"/elections/{election_id}/vote-status", headers=voter_headers)
        self.assertEqual(res_status_after.status_code, 200)
        self.assertTrue(res_status_after.get_json()["has_voted"])
        self.assertEqual(res_status_after.get_json()["vote"]["candidate_id"], chosen_candidate_id)

        # 8. Check Certified Results Tally Updated
        res_results = self.client.get(f"/elections/{election_id}/results")
        self.assertEqual(res_results.status_code, 200)
        updated_results = res_results.get_json()
        matching_cand = next(c for c in updated_results["candidates"] if c["id"] == chosen_candidate_id)
        self.assertEqual(matching_cand["votes"], initial_votes + 1)

        # 9. Presiding Officer Pause and Resume Workflow
        res_officer_login = self.client.post("/auth/login", json={"login_id": "officer", "password": "Password123!"})
        officer_token = res_officer_login.get_json()["token"]
        officer_headers = {"Authorization": f"Bearer {officer_token}"}

        # Pause election
        res_pause = self.client.patch(f"/elections/{election_id}/status", headers=officer_headers, json={"is_active": 0})
        self.assertEqual(res_pause.status_code, 200)

        # Login voter2 and try to vote in paused election
        res_voter2_login = self.client.post("/auth/login", json={"login_id": "voter2", "password": "Password123!"})
        voter2_token = res_voter2_login.get_json()["token"]
        voter2_headers = {"Authorization": f"Bearer {voter2_token}"}

        res_vote_paused = self.client.post(f"/elections/{election_id}/vote", headers=voter2_headers, json={
            "candidate_id": chosen_candidate_id
        })
        self.assertEqual(res_vote_paused.status_code, 400)
        self.assertIn("inactive", res_vote_paused.get_json()["error"])

        # Officer re-opens election
        res_resume = self.client.patch(f"/elections/{election_id}/status", headers=officer_headers, json={"is_active": 1})
        self.assertEqual(res_resume.status_code, 200)

        # 10. Super Admin Governance
        res_super_login = self.client.post("/auth/login", json={"login_id": "superadmin", "password": "Password123!"})
        super_token = res_super_login.get_json()["token"]
        super_headers = {"Authorization": f"Bearer {super_token}"}

        # Super admin promotes e2e_voter to presiding_officer
        res_promote = self.client.patch(f"/user/{voter_id}/role", headers=super_headers, json={"role": "presiding_officer"})
        self.assertEqual(res_promote.status_code, 200)

        # Verify promotion
        res_verify_user = self.client.get(f"/user/{voter_id}", headers=super_headers)
        self.assertEqual(res_verify_user.status_code, 200)
        self.assertEqual(res_verify_user.get_json()["role"], "presiding_officer")

        # Super admin deletes e2e_voter and cleans up
        res_del = self.client.delete(f"/user/{voter_id}", headers=super_headers)
        self.assertEqual(res_del.status_code, 200)

if __name__ == "__main__":
    unittest.main()
