import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { BASE_URL } from "../config/BaseUrl";

type Candidate = {
  id: number;
  election_id: number;
  name: string;
  party: string;
  slogan: string;
  symbol: string | null;
  symbol_url: string | null;
};

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    election_id: "",
    name: "",
    party: "",
    slogan: "",
  });
  const [symbolFile, setSymbolFile] = useState<File | null>(null);

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/candidates`);
      setCandidates(res.data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Add candidate
  const handleAddCandidate = async () => {
    if (!formData.name || !symbolFile || !formData.election_id) {
      return alert("Election, Name and Symbol are required");
    }

    const payload = new FormData();
    payload.append("election_id", formData.election_id);
    payload.append("name", formData.name);
    payload.append("party", formData.party);
    payload.append("slogan", formData.slogan);
    payload.append("symbol", symbolFile);

    try {
      await axios.post(`${BASE_URL}/candidates`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setShowModal(false);
      setFormData({ election_id: "", name: "", party: "", slogan: "" });
      setSymbolFile(null);
      fetchCandidates();
    } catch (err) {
      console.error("Error adding candidate:", err);
    }
  };

  // Delete candidate
  const handleDeleteCandidate = async (id: number) => {
    if (!window.confirm("Delete candidate?")) return;
    try {
      await axios.delete(`${BASE_URL}/candidates/${id}`);
      fetchCandidates();
    } catch (err) {
      console.error("Error deleting candidate:", err);
    }
  };

  return (
    <div className="manage-candidates mt-4">
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
                  <h6 className="fw-bold mb-0">{c.name}</h6>
                  {c.symbol_url && (
                    <img
                      src={c.symbol_url}
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
                    Election #{c.election_id}
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
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Election ID"
                  value={formData.election_id}
                  onChange={(e) =>
                    setFormData({ ...formData, election_id: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
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
