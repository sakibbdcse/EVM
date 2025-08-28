import Candidate from "../components/Candidate";

const Home = () => {
  return (
    <>
      <div className="container my-5 flex-grow-1">
        <h1 className="display-4 fw-bold mb-3 text-center">Voter Dashboard</h1>
        <p className="lead text-center mb-5">
          Your home for all things election-related.
        </p>

        <div className="row mb-4">
          <div className="col-12">
            <div className="card p-4 shadow-sm text-center">
              <h5 className="fw-bold text-success mb-3">
                Election Status: Student Council President
              </h5>
              <p className="mb-1">
                <span className="fw-semibold">Start Time:</span>{" "}
                <span>8/25/2024, 3:00:00 PM</span>
              </p>
              <p className="mb-0">
                <span className="fw-semibold">End Time:</span>{" "}
                <span>8/26/2024, 11:00:00 PM</span>
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow-sm h-100">
              <h5 className="fw-bold text-success mb-3">Your Profile</h5>
              <div className="text-center mb-3">
                <img
                  className="profile-photo"
                  alt="Voter Photo"
                  src="/images/profavater.jpg"
                />
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Name:
                  <span className="text-muted">Jane Doe</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Email:
                  <span className="text-muted">jane.doe@example.com</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Address:
                  <span className="text-muted text-end">
                    123 Main Street, Anytown, State, 12345
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Status:
                  <span className="badge bg-success" id="votingStatus">
                    Eligible to Vote
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow-sm h-100">
              <h5 className="fw-bold text-success mb-3">Active Elections</h5>
              <p className="text-muted">
                Click on a candidate to cast your vote.
              </p>
              <div className="row">
                <Candidate />
                <Candidate />
                <Candidate />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
