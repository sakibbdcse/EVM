const PresidingOfficerDashboard = () => {
  return (
    <>
      <div className="container my-5 flex-grow-1">
        <h1 className="display-4 fw-bold mb-3 text-center text-dark">
          Presiding Officer Dashboard
        </h1>
        <p className="lead text-center mb-5 text-muted">
          Manage election details, candidates, and voting controls.
        </p>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="card p-5 h-100">
              <h5 className="fw-bold text-primary mb-4">
                Election Status &amp; Controls
              </h5>
              <div className="d-flex align-items-center mb-3">
                <span className="fw-medium me-3">Status:</span>
                <span className="badge bg-warning text-dark py-2 px-3">
                  Election Not Started
                </span>
              </div>
              <p className="text-muted mb-4">
                Use the buttons below to control the election.
              </p>
              <div className="d-grid gap-2">
                <button className="btn btn-lg btn-custom-primary">
                  Start Election
                </button>
                <button className="btn btn-lg btn-secondary">
                  End Election
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-5 h-100">
              <h5 className="fw-bold text-primary mb-4">
                Set Election Details
              </h5>
              <form>
                <div className="mb-4">
                  <label className="form-label fw-medium">
                    Election Start Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="startDate"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium">
                    Election End Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="endDate"
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-custom-primary">
                    Save Details
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-12">
            <div className="card p-5">
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
                  <button className="btn btn-sm btn-outline-secondary">
                    Edit
                  </button>
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
                  <button className="btn btn-sm btn-outline-secondary">
                    Edit
                  </button>
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
                  <button className="btn btn-sm btn-outline-secondary">
                    Edit
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PresidingOfficerDashboard;
