import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { BASE_URL } from "../config/BaseUrl";

type Candidate = {
  id: number;
  election_id: number;
  user_id: number;
  party: string;
  slogan: string;
  symbol?: string;
  symbol_url?: string;
};

type User = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
};

type Election = {
  id: number;
  title: string;
};

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    election_id: "",
    user_id: "",
    party: "",
    slogan: "",
  });
  const [symbolFile, setSymbolFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const token = localStorage.getItem("token");

  // Fetch candidates
  const fetchCandidates = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/candidates`);
      setCandidates(res.data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, [token]);

  // Fetch elections
  const fetchElections = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/elections`);
      setElections(res.data);
    } catch (err) {
      console.error("Error fetching elections:", err);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
    fetchUsers();
    fetchElections();
  }, [fetchCandidates, fetchUsers, fetchElections]);

  // Add candidate
  const handleAddCandidate = async () => {
    setErrorMsg(""); // reset old errors
    if (!formData.user_id || !symbolFile || !formData.election_id) {
      return setErrorMsg("⚠️ Election, User and Symbol are required.");
    }

    const payload = new FormData();
    payload.append("election_id", formData.election_id);
    payload.append("user_id", formData.user_id);
    payload.append("party", formData.party);
    payload.append("slogan", formData.slogan);
    payload.append("symbol", symbolFile);

    try {
      await axios.post(`${BASE_URL}/candidates`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setShowModal(false);
      setFormData({ election_id: "", user_id: "", party: "", slogan: "" });
      setSymbolFile(null);
      fetchCandidates();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.error || "❌ Failed to add candidate.");
      } else {
        setErrorMsg("❌ Unexpected error occurred.");
      }
      console.error("Error adding candidate:", err);
    }
  };

  // Delete candidate
  const handleDeleteCandidate = async (id: number) => {
    if (!window.confirm("Delete candidate?")) return;
    try {
      await axios.delete(`${BASE_URL}/candidates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCandidates();
    } catch (err) {
      console.error("Error deleting candidate:", err);
    }
  };

  // Helper: get candidate name from users
  const getCandidateName = (user_id: number) => {
    const user = users.find((u) => u.id === user_id);
    return user
      ? `${user.first_name} ${user.last_name} (${user.username})`
      : "Unknown User";
  };

  // Helper: get election name
  const getElectionName = (election_id: number) => {
    const election = elections.find((e) => e.id === election_id);
    return election ? election.title : `Election #${election_id}`;
  };

  return (
    <div className="manage-candidates mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-success mb-0">
          Manage Candidates ({candidates.length})
        </h5>
        <button
          className="btn btn-success fw-semibold"
          onClick={() => setShowModal(true)}
        >
          Add Candidate
        </button>
      </div>

      {/* Candidate List */}
      <div className="list-group">
        {candidates.map((c) => (
          <div
            key={c.id}
            className="list-group-item bg-white shadow-sm mb-2 rounded d-flex justify-content-between align-items-center py-2"
          >
            <div className="d-flex align-items-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 className="fw-bold mb-0">
                    {getCandidateName(c.user_id)}
                  </h6>
                  {c.symbol_url && (
                    <img
                      src={`${BASE_URL}/${c.symbol_url}`}
                      alt="Symbol"
                      className="rounded-circle border"
                      width={50}
                      height={50}
                    />
                  )}
                </div>
                <p className="text-muted mb-1">{c.party}</p>
                <small className="text-secondary fst-italic">{c.slogan}</small>
                <div>
                  <small className="badge bg-light text-dark">
                    {getElectionName(c.election_id)}
                  </small>
                </div>
              </div>
            </div>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-primary p-1">
                <FaEdit size={14} />
              </button>
              <button
                className="btn btn-sm btn-outline-danger p-1"
                onClick={() => handleDeleteCandidate(c.id)}
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Candidate</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {errorMsg && (
                  <div className="alert alert-danger py-2">{errorMsg}</div>
                )}

                {/* Election dropdown */}
                <select
                  className="form-control mb-2"
                  value={formData.election_id}
                  onChange={(e) =>
                    setFormData({ ...formData, election_id: e.target.value })
                  }
                >
                  <option value="">Select Election</option>
                  {elections.map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.title}
                    </option>
                  ))}
                </select>

                {/* Dynamic User Selection */}
                <select
                  className="form-control mb-2"
                  value={formData.user_id}
                  onChange={(e) =>
                    setFormData({ ...formData, user_id: e.target.value })
                  }
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.username})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Party"
                  value={formData.party}
                  onChange={(e) =>
                    setFormData({ ...formData, party: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Slogan"
                  value={formData.slogan}
                  onChange={(e) =>
                    setFormData({ ...formData, slogan: e.target.value })
                  }
                />
                <input
                  type="file"
                  className="form-control mb-2"
                  accept="image/*"
                  onChange={(e) => setSymbolFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleAddCandidate}
                >
                  Save Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCandidates;
