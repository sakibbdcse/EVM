import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";
import { setHasVoted } from "../redux/authSlice";
import type { RootState } from "../redux/store";
import Candidate, { type CandidateItem } from "../components/Candidate";
import Profile from "../components/Profile";
import ElectionStatus, { type Election } from "../components/ElectionStatus";
import { FaVoteYea, FaCheckCircle, FaExclamationTriangle, FaChartBar } from "react-icons/fa";
import { Link } from "react-router-dom";

const VoterDashboard = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const activeToken = token || localStorage.getItem("token");

  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [voterVoteStatus, setVoterVoteStatus] = useState<{
    has_voted: boolean;
    candidate_id?: number | null;
  }>({ has_voted: user?.has_voted || false });

  const [confirmCandidate, setConfirmCandidate] = useState<CandidateItem | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  // Fetch active election and candidate list
  const loadData = useCallback(async () => {
    setLoading(true);
    setAlertMsg(null);
    try {
      // 1. Fetch active election
      const electionRes = await axios.get(`${BASE_URL}/elections/active`);
      const electionData = electionRes.data;
      setActiveElection(electionData);

      // 2. Fetch candidates for this election
      const candidatesRes = await axios.get(
        `${BASE_URL}/candidates?election_id=${electionData.id}`
      );
      setCandidates(candidatesRes.data);

      // 3. Fetch current voter's vote status for this election
      if (activeToken) {
        try {
          const statusRes = await axios.get(
            `${BASE_URL}/elections/${electionData.id}/vote-status`,
            { headers: { Authorization: `Bearer ${activeToken}` } }
          );
          if (statusRes.data.has_voted) {
            setVoterVoteStatus({
              has_voted: true,
              candidate_id: statusRes.data.vote?.candidate_id,
            });
            dispatch(setHasVoted(true));
          } else {
            setVoterVoteStatus({ has_voted: false, candidate_id: null });
          }
        } catch (err) {
          console.error("Error checking vote status:", err);
        }
      }
    } catch (err) {
      console.error("Failed to load active election:", err);
    } finally {
      setLoading(false);
    }
  }, [activeToken, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Initiate voting confirmation modal
  const handleInitiateVote = (candidateId: number) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate) {
      setConfirmCandidate(candidate);
    }
  };

  // Submit confirmed vote to backend API
  const handleConfirmVote = async () => {
    if (!confirmCandidate || !activeElection || !activeToken) return;

    setIsVoting(true);
    setAlertMsg(null);
    try {
      const res = await axios.post(
        `${BASE_URL}/elections/${activeElection.id}/vote`,
        { candidate_id: confirmCandidate.id },
        {
          headers: {
            Authorization: `Bearer ${activeToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAlertMsg({
        type: "success",
        text: res.data.message || "Your official ballot has been recorded securely!",
      });

      // Update state
      setVoterVoteStatus({
        has_voted: true,
        candidate_id: confirmCandidate.id,
      });
      dispatch(setHasVoted(true));
      setConfirmCandidate(null);

      // Refresh candidate votes tally
      loadData();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setAlertMsg({
          type: "danger",
          text: err.response?.data?.error || "Failed to submit ballot.",
        });
      } else {
        setAlertMsg({
          type: "danger",
          text: "An unexpected error occurred while casting vote.",
        });
      }
    } finally {
      setIsVoting(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Authenticating voter credentials...</p>
      </div>
    );
  }

  return (
    <div className="container py-4 my-2">
      {/* Voter Header Banner */}
      <div className="card shadow-sm border-0 p-4 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="fw-bold text-dark mb-1">
              Welcome, {user.first_name} {user.last_name}
            </h2>
            <p className="text-muted small mb-0">
              National Voter Portal | Constituency Verified:{" "}
              <strong>
                {user.address
                  ? `${user.address.division}, ${user.address.district}`
                  : "National Roster"}
              </strong>
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {voterVoteStatus.has_voted ? (
              <span className="badge bg-success-subtle text-success border border-success px-3 py-2 fs-6 rounded-pill d-flex align-items-center gap-1">
                <FaCheckCircle /> Ballot Certified & Recorded
              </span>
            ) : (
              <span className="badge bg-warning-subtle text-warning border border-warning px-3 py-2 fs-6 rounded-pill d-flex align-items-center gap-1">
                <FaVoteYea /> Eligible to Vote
              </span>
            )}
          </div>
        </div>
      </div>

      {alertMsg && (
        <div
          className={`alert alert-${alertMsg.type} shadow-sm d-flex align-items-center gap-2 mb-4 p-3 rounded-3`}
        >
          {alertMsg.type === "success" ? (
            <FaCheckCircle className="fs-5 text-success" />
          ) : (
            <FaExclamationTriangle className="fs-5 text-danger" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Row with Election Status & Countdown */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <ElectionStatus electionId={activeElection?.id} />
        </div>
      </div>

      <div className="row g-4">
        {/* Profile Column */}
        <div className="col-lg-5">
          <Profile user={user} token={activeToken || ""} />
        </div>

        {/* Voting Ballot Column */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <h5 className="fw-bold text-primary mb-0">Official Digital Ballot</h5>
                <small className="text-muted">
                  {activeElection
                    ? `Candidates for: ${activeElection.title}`
                    : "No election active"}
                </small>
              </div>

              {activeElection && (
                <Link
                  to={`/results?election_id=${activeElection.id}`}
                  className="btn btn-outline-success btn-sm rounded-pill d-flex align-items-center gap-1 fw-semibold"
                >
                  <FaChartBar /> Live Results
                </Link>
              )}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Retrieving candidate nominations...</p>
              </div>
            ) : !activeElection ? (
              <div className="alert alert-light text-center py-5 border">
                <p className="text-muted mb-0">There is currently no active election open for voting.</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="alert alert-light text-center py-5 border">
                <p className="text-muted mb-0">No candidates have been nominated for this election yet.</p>
              </div>
            ) : (
              <>
                {voterVoteStatus.has_voted && (
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
                    <FaCheckCircle className="fs-4 flex-shrink-0" />
                    <div>
                      <strong>Your vote has been cast.</strong> Thank you for exercising your democratic right! You can follow the live tally below.
                    </div>
                  </div>
                )}

                <div className="row g-3">
                  {candidates.map((candidate) => (
                    <Candidate
                      key={candidate.id}
                      candidate={candidate}
                      hasVoted={voterVoteStatus.has_voted}
                      userVotedCandidateId={voterVoteStatus.candidate_id}
                      onVote={handleInitiateVote}
                      isVoting={isVoting}
                      canVote={!voterVoteStatus.has_voted && activeElection.is_active === true}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmCandidate && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Confirm Your Vote</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmCandidate(null)}
                  disabled={isVoting}
                ></button>
              </div>
              <div className="modal-body text-center p-4">
                <FaVoteYea className="text-success fs-1 mb-3" />
                <h4 className="fw-bold mb-1">
                  {confirmCandidate.name ||
                    `${confirmCandidate.first_name} ${confirmCandidate.last_name}`}
                </h4>
                <p className="text-primary fw-semibold mb-3">
                  {confirmCandidate.party}
                </p>
                <div className="alert alert-warning small text-start mb-0">
                  <strong>Important Notice:</strong> Once submitted, your vote is cryptographically sealed in the database and cannot be modified or withdrawn.
                </div>
              </div>
              <div className="modal-footer border-top justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setConfirmCandidate(null)}
                  disabled={isVoting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success rounded-pill px-4 fw-semibold"
                  onClick={handleConfirmVote}
                  disabled={isVoting}
                >
                  {isVoting ? "Sealing Ballot..." : "Yes, Cast My Vote"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterDashboard;
