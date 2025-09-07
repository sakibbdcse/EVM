import { FaEdit, FaTrash } from "react-icons/fa";

const ManageCandidates = () => {
  const candidates = [
    {
      id: 1,
      name: "Candidate A",
      party: "Party X",
      slogan: "A new era of progress.",
      photo: "https://placehold.co/60x60/A3E635/000000?text=A",
      symbol: "https://placehold.co/60x60/22D3EE/000000?text=X",
    },
    {
      id: 2,
      name: "Candidate B",
      party: "Party Y",
      slogan: "Building a better future together.",
      photo: "https://placehold.co/60x60/FACC15/000000?text=B",
      symbol: "https://placehold.co/60x60/F472B6/000000?text=Y",
    },
    {
      id: 3,
      name: "Candidate C",
      party: "Party Z",
      slogan: "Leadership with integrity.",
      photo: "https://placehold.co/60x60/F43F5E/000000?text=C",
      symbol: "https://placehold.co/60x60/3B82F6/000000?text=Z",
    },
  ];

  return (
    <div className="manage-candidates mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-success mb-0">
          Manage Candidates ({candidates.length})
        </h5>
        <button className="btn btn-success fw-semibold">
          Add New Candidate
        </button>
      </div>

      <div className="list-group">
        {candidates.map((c) => (
          <div
            key={c.id}
            className="list-group-item bg-white shadow-sm mb-2 rounded d-flex justify-content-between align-items-center py-2"
          >
            <div className="d-flex align-items-center gap-3">
              {/* Candidate Photo */}
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
                  {/* Party Symbol */}
                  <img
                    src={c.symbol}
                    alt={`${c.party} symbol`}
                    className="rounded-circle border"
                    width={50}
                    height={50}
                  />
                </div>
                <p className="text-muted mb-1">{c.party}</p>
                <small className="text-secondary fst-italic">{c.slogan}</small>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-primary p-1">
                <FaEdit size={14} />
              </button>
              <button className="btn btn-sm btn-outline-danger p-1">
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCandidates;
