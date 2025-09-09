import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { BASE_URL } from "../config/BaseUrl";

type Candidate = {
  id: number;
  name: string;
  party: string;
  slogan: string;
  photo: string;
  symbol: string;
};

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    slogan: "",
    photo: "",
    symbol: "",
  });
  const [symbolFile, setSymbolFile] = useState<File | null>(null);

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/candidates`);
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Add candidate
  const handleAddCandidate = async () => {
    if (!formData.name || !formData.symbol)
      return alert("Name and Symbol required");

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("party", formData.party);
    payload.append("slogan", formData.slogan);
    payload.append("photo", formData.photo); // optional
    if (symbolFile) payload.append("symbol", symbolFile);

    try {
      await axios.post(`${BASE_URL}/candidates`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setShowModal(false);
      setFormData({ name: "", party: "", slogan: "", photo: "", symbol: "" });
      setSymbolFile(null);
      fetchCandidates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCandidate = async (id: number) => {
    if (!window.confirm("Delete candidate?")) return;
    try {
      await axios.delete(`${BASE_URL}/candidates/${id}`);
      fetchCandidates();
    } catch (err) {
      console.error(err);
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
              <img
                src={c.photo}
                alt={`${c.name} photo`}
                className="rounded-circle border"
                width={40}
                height={40}
              />
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 className="fw-bold mb-0">{c.name}</h6>
                  <img
                    src={c.symbol}
                    alt="Symbol"
                    className="rounded-circle border"
                    width={50}
                    height={50}
                  />
                </div>
                <p className="text-muted mb-1">{c.party}</p>
                <small className="text-secondary fst-italic">{c.slogan}</small>
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
                  type="text"
                  className="form-control mb-2"
                  placeholder="Photo URL (optional)"
                  value={formData.photo}
                  onChange={(e) =>
                    setFormData({ ...formData, photo: e.target.value })
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
