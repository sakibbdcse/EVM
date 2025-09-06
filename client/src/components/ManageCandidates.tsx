const ManageCandidates = () => {
  return (
    <>
      <div className="">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold text-primary mb-0">Manage Candidates</h5>
          <button className="btn btn-custom-primary fw-semibold">
            Add New Candidate
          </button>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center py-3 border-0">
            <div className="d-flex align-items-center">
              <img
                src="https://placehold.co/80x80/A3E635/000000?text=A"
                className="candidate-photo"
                alt="Candidate A photo"
              />
              <div>
                <h6 className="fw-bold mb-0">Candidate A</h6>
                <p className="text-muted mb-1">Party X</p>
                <small className="text-secondary fst-italic">
                  "A new era of progress."
                </small>
              </div>
            </div>
            <button className="btn btn-sm btn-outline-secondary">Edit</button>
          </li>
          <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center py-3 border-0">
            <div className="d-flex align-items-center">
              <img
                src="https://placehold.co/80x80/FACC15/000000?text=B"
                className="candidate-photo"
                alt="Candidate B photo"
              />
              <div>
                <h6 className="fw-bold mb-0">Candidate B</h6>
                <p className="text-muted mb-1">Party Y</p>
                <small className="text-secondary fst-italic">
                  "Building a better future together."
                </small>
              </div>
            </div>
            <button className="btn btn-sm btn-outline-secondary">Edit</button>
          </li>

          <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center py-3 border-0">
            <div className="d-flex align-items-center">
              <img
                src="https://placehold.co/80x80/F43F5E/000000?text=C"
                className="candidate-photo"
                alt="Candidate C photo"
              />
              <div>
                <h6 className="fw-bold mb-0">Candidate C</h6>
                <p className="text-muted mb-1">Party Z</p>
                <small className="text-secondary fst-italic">
                  "Leadership with integrity."
                </small>
              </div>
            </div>
            <button className="btn btn-sm btn-outline-secondary">Edit</button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default ManageCandidates;
