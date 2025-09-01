import { useState } from "react";
import { useSelector } from "react-redux";
import { FaUser, FaVoteYea, FaClock, FaInfoCircle } from "react-icons/fa";
import type { RootState } from "../redux/store";

const MOCK_ELECTION = {
  status: "Ongoing",
  startDate: "2025-09-01",
  endDate: "2025-09-15",
};

const MOCK_CANDIDATES = [
  {
    id: "c1",
    name: "John Smith",
    party: "Green Party",
    votes: 1200,
    description: "Experienced politician with community focus.",
    photoUrl: "https://placehold.co/100x100/00A3E0/fff?text=JS",
  },
  {
    id: "c2",
    name: "Mary Johnson",
    party: "Blue Party",
    votes: 900,
    description: "Dedicated to public service and education.",
    photoUrl: "https://placehold.co/100x100/F0A500/fff?text=MJ",
  },
];

const VoterDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [electionData] = useState(MOCK_ELECTION);
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [isVoting, setIsVoting] = useState(false);
  if (!user) return <p className="text-center mt-5">Loading user data...</p>;
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString();

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  const getVotePercentage = (votes: number) => {
    return totalVotes ? ((votes / totalVotes) * 100).toFixed(1) : "0";
  };

  const handleVote = (candidateId: string) => {
    if (user.hasVoted) return;
    setIsVoting(true);
    setTimeout(() => {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
        )
      );
      setIsVoting(false);
      alert("✅ Vote cast successfully!");
    }, 1000);
  };

  return (
    <div className="container bg-light">
      <div className="container mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card shadow-sm text-center p-3 d-flex flex-column align-items-center justify-content-center">
              <FaClock size={32} className="text-success mb-2" />
              <h6 className="mb-1">Election Status</h6>
              <p className="mb-0 fw-bold">{electionData.status}</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm text-center p-3 d-flex flex-column align-items-center justify-content-center">
              <FaUser size={32} className="text-primary mb-2" />
              <h6 className="mb-1">Total Voters</h6>
              <p className="mb-0 fw-bold">1,250</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm text-center p-3 d-flex flex-column align-items-center justify-content-center">
              <FaVoteYea size={32} className="text-success mb-2" />
              <h6 className="mb-1">Votes Cast</h6>
              <p className="mb-0 fw-bold">{totalVotes}</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm text-center p-3 d-flex flex-column align-items-center justify-content-center">
              <FaInfoCircle size={32} className="text-warning mb-2" />
              <h6 className="mb-1">Ends On</h6>
              <p className="mb-0 fw-bold">{formatDate(electionData.endDate)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row g-4">
          {/* Profile Card */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header text-center bg-success text-white">
                <h5 className="mb-0">Voter Profile</h5>
              </div>
              <div className="card-body text-center">
                <img
                  src={
                    user.photoUrl ||
                    "https://placehold.co/120x120/A0E7A5/000?text=JD"
                  }
                  alt={user.first_name}
                  className="rounded-circle mb-3 border border-success p-1"
                  width={120}
                  height={120}
                />
                <h5 className="fw-bold">
                  {user.first_name} {user.last_name}
                </h5>
                <p className="text-muted">{user.email}</p>
              </div>

              {/* Profile Info in Table Style */}
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <tbody>
                    <tr>
                      <th className="bg-light">Address</th>
                      <td>{user.address || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Phone</th>
                      <td>{user.phone || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Date of Birth</th>
                      <td>{user.birthdate || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Gender</th>
                      <td>{user.gender || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">National ID</th>
                      <td>{user.nid || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Status</th>
                      <td>
                        <span
                          className={`badge ${
                            user.hasVoted ? "bg-success" : "bg-warning"
                          }`}
                        >
                          {user.hasVoted ? "Voted" : "Not Voted"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Live Results */}
          <div className="col-lg-8">
            <div className="card shadow-sm p-3">
              <h5 className="card-title border-bottom pb-2 mb-3">
                {" "}
                Live Results{" "}
              </h5>
              {candidates.map((c) => (
                <div key={c.id} className="mb-3 p-3 border rounded">
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={c.photoUrl}
                      alt={c.name}
                      className="rounded-circle me-3"
                      width={50}
                      height={50}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{c.name}</h6>
                      <small className="text-muted">{c.party}</small>
                    </div>
                    <div className="text-end" style={{ minWidth: "80px" }}>
                      <span className="fw-bold text-success">{c.votes}</span>
                      <small className="d-block">
                        {getVotePercentage(c.votes)}%
                      </small>
                    </div>
                  </div>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${getVotePercentage(c.votes)}%` }}
                      aria-valuenow={Number(getVotePercentage(c.votes))}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Voting Cards */}
          {!user.hasVoted && (
            <div className="col-12">
              <h5 className="mb-3">Cast Your Vote</h5>
              <div className="row g-3">
                {candidates.map((c) => (
                  <div key={c.id} className="col-sm-6 col-lg-3">
                    <div className="card h-100 text-center shadow-sm hover-shadow">
                      <img
                        src={c.photoUrl}
                        alt={c.name}
                        className="rounded-circle mx-auto mt-3"
                        style={{ width: 80, height: 80 }}
                      />
                      <div className="card-body">
                        <h6 className="text-success fw-bold">{c.name}</h6>
                        <p className="mb-1">{c.party}</p>
                        <p className="small text-muted">{c.description}</p>
                        <button
                          className="btn btn-success btn-sm mt-2 w-100"
                          onClick={() => handleVote(c.id)}
                          disabled={isVoting}
                        >
                          {isVoting ? "Voting..." : "Vote"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extra Info */}
          <div className="col-lg-4">
            <div className="card shadow-sm p-3 text-center">
              <h6 className="fw-bold">Account Settings</h6>
              <p>Manage your profile, password, and preferences.</p>
              <button className="btn btn-outline-success w-100">
                Edit Profile
              </button>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card shadow-sm p-3 text-center">
              <h6 className="fw-bold">Other Information</h6>
              <p>Find announcements, election news, and FAQs.</p>
              <button className="btn btn-outline-primary w-100">
                Read More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterDashboard;
