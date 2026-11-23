import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaPlus, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { BASE_URL, getImageUrl } from "../config/BaseUrl";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

export type Candidate = {
  id: number;
  election_id: number;
  election_title?: string;
  user_id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  party: string;
  slogan: string;
  description?: string;
  symbol?: string;
  symbol_url?: string;
  photo?: string;
  photo_url?: string;
  votes?: number;
};

type UserOption = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
};

type ElectionOption = {
  id: number;
  title: string;
  is_active: boolean;
};

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [elections, setElections] = useState<ElectionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    election_id: "",
    user_id: "",
    party: "",
    slogan: "",
    description: "",
  });
  const [symbolFile, setSymbolFile] = useState<File | null>(null);
  const [symbolPreview, setSymbolPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { token } = useSelector((state: RootState) => state.auth);
  const activeToken = token || localStorage.getItem("token");

  // Fetch candidates
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/candidates`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      setCandidates(res.data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setLoading(false);
    }
  }, [activeToken]);

  // Fetch users for nomination
  const fetchUsers = useCallback(async () => {
    if (!activeToken) return;
    try {
      const res = await axios.get(`${BASE_URL}/user/all`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, [activeToken]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSymbolFile(file);
    if (file) {
      setSymbolPreview(URL.createObjectURL(file));
    } else {
      setSymbolPreview(null);
    }
  };

  // Add Candidate
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.election_id || !formData.user_id || !formData.party) {
      setErrorMsg("Please select an Election, User, and provide Party Name.");
      return;
    }

    const payload = new FormData();
    payload.append("election_id", formData.election_id);
    payload.append("user_id", formData.user_id);
    payload.append("party", formData.party);
    payload.append("slogan", formData.slogan);
    payload.append("description", formData.description);
    if (symbolFile) {
      payload.append("symbol", symbolFile);
    }

    try {
      const res = await axios.post(`${BASE_URL}/candidates`, payload, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      setSuccessMsg(res.data.message || "Candidate added successfully!");
      setShowModal(false);
      setFormData({
        election_id: "",
        user_id: "",
        party: "",
        slogan: "",
        description: "",
      });
      setSymbolFile(null);
      setSymbolPreview(null);
      fetchCandidates();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.error || "Failed to add candidate.");
      } else {
        setErrorMsg("Unexpected error occurred.");
      }
    }
  };

  // Delete candidate
  const handleDeleteCandidate = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this candidate? Any votes recorded for them will also be removed.")) {
      return;
    }

    try {
      const res = await axios.delete(`${BASE_URL}/candidates/${id}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      setSuccessMsg(res.data.message || "Candidate removed.");
      fetchCandidates();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.error || "Failed to delete candidate.");
      } else {
        setErrorMsg("Failed to delete candidate.");
      }
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold text-primary mb-0">Candidate Management</h5>
          <small className="text-muted">Total Nominated Candidates: {candidates.length}</small>
        </div>
        <button
          className="btn btn-primary btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-2 fw-semibold"
          onClick={() => {
            setErrorMsg(null);
            setSuccessMsg(null);
            setShowModal(true);
          }}
        >
          <FaPlus /> Nominate Candidate
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-3">
          <FaCheckCircle /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
          <FaExclamationTriangle /> {errorMsg}
        </div>
      )}

      {/* Candidate List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="alert alert-light text-center py-4 border">
          <p className="text-muted mb-0">No candidates nominated yet. Click "Nominate Candidate" to add candidates.</p>
        </div>
      ) : (
        <div className="list-group gap-2">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 rounded-3 border shadow-sm"
            >
              <div className="d-flex align-items-center gap-3">
                {/* Candidate Avatar */}
                <img
                  src={
                    c.photo_url
                      ? getImageUrl(c.photo_url)
                      : "https://placehold.co/50x50/e2e8f0/475569?text=C"
                  }
                  alt={c.name || "Candidate"}
                  className="rounded-circle border"
                  style={{ width: 50, height: 50, objectFit: "cover" }}
                />

                {/* Symbol */}
                {c.symbol_url && (
                  <img
                    src={getImageUrl(c.symbol_url)}
                    alt="Symbol"
                    className="rounded-circle border border-warning"
                    style={{ width: 45, height: 45, objectFit: "contain", backgroundColor: "#fff" }}
                    title={`Symbol: ${c.party}`}
                  />
                )}

                <div>
                  <h6 className="fw-bold mb-0 text-dark">
                    {c.name || `${c.first_name} ${c.last_name}`}
                    {c.username && <small className="text-muted fw-normal ms-1">(@{c.username})</small>}
                  </h6>
                  <div className="d-flex align-items-center gap-2 my-1">
                    <span className="badge bg-primary-subtle text-primary fw-semibold">
                      {c.party || "Independent"}
                    </span>
                    <span className="badge bg-light text-secondary border">
                      {c.election_title || `Election #${c.election_id}`}
                    </span>
                    <span className="badge bg-success-subtle text-success">
                      {c.votes ?? 0} Votes
                    </span>
                  </div>
                  {c.slogan && <small className="text-secondary fst-italic d-block">"{c.slogan}"</small>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-danger btn-sm p-2 rounded-circle"
                  title="Delete Candidate"
                  onClick={() => handleDeleteCandidate(c.id)}
                >
                  <FaTrash size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nomination Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-primary">Nominate New Candidate</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleAddCandidate}>
                <div className="modal-body">
                  {errorMsg && (
                    <div className="alert alert-danger py-2 small mb-3">
                      <FaExclamationTriangle className="me-1" /> {errorMsg}
                    </div>
                  )}

                  {/* Election Select */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Target Election *</label>
                    <select
                      className="form-select"
                      value={formData.election_id}
                      onChange={(e) => setFormData({ ...formData, election_id: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Election --</option>
                      {elections.map((el) => (
                        <option key={el.id} value={el.id}>
                          {el.title} {el.is_active ? "(Active)" : "(Inactive)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* User Select */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Registered Citizen / User *</label>
                    <select
                      className="form-select"
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      required
                    >
                      <option value="">-- Choose User --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.first_name} {u.last_name} (@{u.username}) - {u.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Party */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Political Party / Affiliation *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Democratic Alliance, Independent"
                      value={formData.party}
                      onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                      required
                    />
                  </div>

                  {/* Slogan */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Campaign Slogan</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Integrity, Progress, and Accountability"
                      value={formData.slogan}
                      onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Manifesto / Short Bio</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Brief manifesto or candidate qualifications"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  {/* Symbol Image File */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Electoral Symbol (Image)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {symbolPreview && (
                      <div className="mt-2 text-center">
                        <img
                          src={symbolPreview}
                          alt="Preview"
                          className="rounded-circle border p-1"
                          style={{ width: 60, height: 60, objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold">
                    Confirm Nomination
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCandidates;
