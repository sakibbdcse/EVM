import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import ElectionStatus, { type Election } from "../components/ElectionStatus";
import ElectionStatusSet from "../components/ElectionStatusSet";
import ManageCandidates from "../components/ManageCandidates";
import Profile from "../components/Profile";
import { FaUserShield, FaPowerOff, FaPlay, FaChartBar, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";

const OfficerDashboard = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const activeToken = token || localStorage.getItem("token");

  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  const fetchActiveElection = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/elections/active`);
      setActiveElection(res.data);
    } catch (err) {
      console.error("Failed to fetch active election:", err);
      setActiveElection(null);
    }
  }, []);

  useEffect(() => {
    fetchActiveElection();
  }, [fetchActiveElection]);

  // Toggle active election on/off
  const handleToggleElection = async (status: boolean) => {
    if (!activeElection) return;
    setLoading(true);
    setActionMsg(null);
    try {
      const res = await axios.patch(
        `${BASE_URL}/elections/${activeElection.id}/status`,
        { is_active: status ? 1 : 0 },
        {
          headers: { Authorization: `Bearer ${activeToken}` },
        }
      );
      setActionMsg({
        type: "success",
        text: res.data.message || `Election ${status ? "started" : "paused"} successfully!`,
      });
      fetchActiveElection();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setActionMsg({
          type: "danger",
          text: err.response?.data?.error || "Failed to update election status.",
        });
      } else {
        setActionMsg({ type: "danger", text: "Error updating election status." });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-4 my-2">
      {/* Officer Header */}
      <div className="card shadow-sm border-0 p-4 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary-subtle text-primary p-3 rounded-circle">
              <FaUserShield className="fs-3" />
            </div>
            <div>
              <h2 className="fw-bold text-dark mb-0">Presiding Officer Control Station</h2>
              <p className="text-muted small mb-0">
                Officer: <strong>{user.first_name} {user.last_name}</strong> (@{user.username}) | Authorized Station Controller
              </p>
            </div>
          </div>

          {activeElection && (
            <Link
              to={`/results?election_id=${activeElection.id}`}
              className="btn btn-outline-success btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1"
            >
              <FaChartBar /> Live Election Monitor
            </Link>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className={`alert alert-${actionMsg.type} d-flex align-items-center gap-2 mb-4 p-3 rounded-3 shadow-sm`}>
          {actionMsg.type === "success" ? <FaCheckCircle className="text-success fs-5" /> : <FaExclamationTriangle className="text-danger fs-5" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Row: Status & Operational Controls */}
      <div className="row g-4 mb-4">
        {/* Current Active Election Control */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-4 h-100">
            <h5 className="fw-bold text-primary mb-3">Live Station & Voting Machine Controls</h5>
            {activeElection ? (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="fw-semibold">Station Status:</span>
                  {activeElection.is_active ? (
                    <span className="badge bg-success px-3 py-2 rounded-pill fs-6">
                      Polls Open (Active)
                    </span>
                  ) : (
                    <span className="badge bg-secondary px-3 py-2 rounded-pill fs-6">
                      Polls Closed (Paused)
                    </span>
                  )}
                </div>

                <div className="bg-light p-3 rounded-3 mb-4 border">
                  <h6 className="fw-bold mb-1">{activeElection.title}</h6>
                  <p className="text-muted small mb-2">{activeElection.description || "Active parliamentary/municipal voting session"}</p>
                  <div className="d-flex justify-content-between small text-muted">
                    <span>Candidates: <strong>{activeElection.candidate_count || 0}</strong></span>
                    <span>Total Ballots Cast: <strong>{activeElection.vote_count || 0}</strong></span>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  {!activeElection.is_active ? (
                    <button
                      className="btn btn-success btn-lg d-flex align-items-center justify-content-center gap-2 rounded-pill fw-semibold"
                      onClick={() => handleToggleElection(true)}
                      disabled={loading}
                    >
                      <FaPlay /> Start & Open Election
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger btn-lg d-flex align-items-center justify-content-center gap-2 rounded-pill fw-semibold"
                      onClick={() => handleToggleElection(false)}
                      disabled={loading}
                    >
                      <FaPowerOff /> Pause / Conclude Election
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="alert alert-light text-center py-4 border">
                <p className="text-muted mb-0">No active election currently loaded. Use the form to configure one.</p>
              </div>
            )}
          </div>
        </div>

        {/* Election Status Countdown */}
        <div className="col-lg-6">
          <ElectionStatus electionId={activeElection?.id} />
        </div>
      </div>

      {/* Row: Set Election Details & Candidates */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <ElectionStatusSet onElectionSaved={fetchActiveElection} />
        </div>
        <div className="col-lg-6">
          <Profile user={user} token={activeToken || ""} />
        </div>
      </div>

      {/* Candidate Management */}
      <div className="row g-4">
        <div className="col-12">
          <ManageCandidates />
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
