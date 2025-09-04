const ElectionStatusSet = () => {
  return (
    <>
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
            <button className="btn btn-lg btn-secondary">End Election</button>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card p-5 h-100">
          <h5 className="fw-bold text-primary mb-4">Set Election Details</h5>
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
    </>
  );
};

export default ElectionStatusSet;
