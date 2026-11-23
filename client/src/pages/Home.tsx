import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";
import type { RootState } from "../redux/store";
import ElectionStatus, { type Election } from "../components/ElectionStatus";
import {
  FaVoteYea,
  FaShieldAlt,
  FaLock,
  FaChartBar,
  FaArrowRight,
  FaFingerprint,
} from "react-icons/fa";

const Home = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeElection, setActiveElection] = useState<Election | null>(null);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/elections/active`);
        setActiveElection(res.data);
      } catch (err) {
        console.error("No active election:", err);
      }
    };
    fetchActive();
  }, []);

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Hero Section */}
      <section className="bg-primary bg-gradient text-white py-5">
        <div className="container px-4 py-4">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase mb-3 shadow-sm">
                Certified Digital Democracy
              </span>
              <h1 className="display-4 fw-bold mb-3">
                Secure, Transparent & Verifiable Electronic Voting
              </h1>
              <p className="lead text-white-50 mb-4" style={{ maxWidth: 600 }}>
                Exercise your constitutional democratic right through our next-generation digital ballot system. Featuring real-time cryptographic audit trails and tamper-evident counting.
              </p>

              <div className="d-flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="btn btn-warning btn-lg rounded-pill px-4 fw-bold shadow d-flex align-items-center gap-2 text-dark"
                  >
                    Open Your Dashboard <FaArrowRight />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn btn-warning btn-lg rounded-pill px-4 fw-bold shadow d-flex align-items-center gap-2 text-dark"
                    >
                      Cast Ballot Now <FaVoteYea />
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold"
                    >
                      Register as Voter
                    </Link>
                  </>
                )}

                <Link
                  to="/results"
                  className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
                >
                  <FaChartBar /> Live Standings
                </Link>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card shadow-lg border-0 rounded-4 overflow-hidden text-dark">
                <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                  <span className="fw-semibold small d-flex align-items-center gap-2">
                    <FaFingerprint className="text-warning" /> Live Election Status
                  </span>
                  <span className="badge bg-success">Online & Audited</span>
                </div>
                <div className="card-body p-4 text-center">
                  {activeElection ? (
                    <>
                      <h4 className="fw-bold mb-2">{activeElection.title}</h4>
                      <p className="text-muted small mb-3">
                        {activeElection.description || "Official Democratic Balloting Session"}
                      </p>
                      <div className="d-flex justify-content-center gap-2 mb-3">
                        <span className="badge bg-primary-subtle text-primary border">
                          {activeElection.candidate_count || 0} Candidates
                        </span>
                        <span className="badge bg-success-subtle text-success border">
                          {activeElection.vote_count || 0} Ballots Cast
                        </span>
                      </div>
                      <Link
                        to={isAuthenticated ? "/dashboard" : "/login"}
                        className="btn btn-success w-100 rounded-pill py-2 fw-semibold"
                      >
                        Enter Ballot Box
                      </Link>
                    </>
                  ) : (
                    <div className="py-3 text-muted">
                      <FaVoteYea className="fs-1 text-primary opacity-50 mb-2" />
                      <p className="mb-0">No election is active at this exact moment.</p>
                      <Link to="/elections" className="btn btn-outline-primary btn-sm rounded-pill mt-3">
                        Browse Upcoming Elections
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Election Countdown Banner */}
      {activeElection && (
        <section className="py-4 bg-white border-bottom shadow-sm">
          <div className="container px-4">
            <ElectionStatus electionId={activeElection.id} />
          </div>
        </section>
      )}

      {/* Security & System Features */}
      <section className="py-5 bg-white">
        <div className="container px-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-2">Pillars of Electoral Integrity</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: 600 }}>
              Built from the ground up to prevent voter fraud, protect ballot secrecy, and deliver mathematically verifiable results.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 p-4 text-center">
                <div className="bg-primary-subtle text-primary p-3 rounded-circle mx-auto mb-3" style={{ width: 64, height: 64 }}>
                  <FaShieldAlt className="fs-3" />
                </div>
                <h5 className="fw-bold mb-2">Double-Voting Prevention</h5>
                <p className="text-muted small mb-0">
                  Unique cryptographic constraints guarantee every citizen can only cast one ballot per election. Re-voting attempts are rejected at the database level.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 p-4 text-center">
                <div className="bg-success-subtle text-success p-3 rounded-circle mx-auto mb-3" style={{ width: 64, height: 64 }}>
                  <FaLock className="fs-3" />
                </div>
                <h5 className="fw-bold mb-2">Cryptographic Ballot Sealing</h5>
                <p className="text-muted small mb-0">
                  Ballots are sealed with immutable timestamps and password hashing using industry-standard PBKDF2 with 1,000,000 iterations.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 p-4 text-center">
                <div className="bg-warning-subtle text-warning p-3 rounded-circle mx-auto mb-3" style={{ width: 64, height: 64 }}>
                  <FaChartBar className="fs-3" />
                </div>
                <h5 className="fw-bold mb-2">Real-Time Certified Tally</h5>
                <p className="text-muted small mb-0">
                  Voters, election officers, and independent observers can view live auto-updating statistics and final winner certifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps To Vote */}
      <section className="py-5 bg-light">
        <div className="container px-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-2">How It Works: 3 Simple Steps</h2>
            <p className="text-muted">A streamlined, user-friendly digital voting workflow.</p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-4 bg-white rounded-4 shadow-sm h-100">
                <div className="badge bg-primary rounded-circle fs-5 mb-3" style={{ width: 45, height: 45, lineHeight: "32px" }}>
                  1
                </div>
                <h5 className="fw-bold">Register & Authenticate</h5>
                <p className="text-muted small mb-0">
                  Sign up with your verified National ID (NID), mobile number, and residential constituency address.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 bg-white rounded-4 shadow-sm h-100">
                <div className="badge bg-primary rounded-circle fs-5 mb-3" style={{ width: 45, height: 45, lineHeight: "32px" }}>
                  2
                </div>
                <h5 className="fw-bold">Select Candidate & Vote</h5>
                <p className="text-muted small mb-0">
                  Review nominated candidates, party manifestos, and electoral symbols. Submit your confirmed choice.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 bg-white rounded-4 shadow-sm h-100">
                <div className="badge bg-primary rounded-circle fs-5 mb-3" style={{ width: 45, height: 45, lineHeight: "32px" }}>
                  3
                </div>
                <h5 className="fw-bold">Verify & Monitor Results</h5>
                <p className="text-muted small mb-0">
                  Receive a cryptographically verified vote status and follow the real-time public counting dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
