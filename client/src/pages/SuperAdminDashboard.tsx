import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import ElectionStatusSet from "../components/ElectionStatusSet";
import ManageCandidates from "../components/ManageCandidates";
import UserManagement from "../components/UserManagement";
import Profile from "../components/Profile";
import ElectionStatus from "../components/ElectionStatus";
import {
  FaCrown,
  FaVoteYea,
  FaUsers,
  FaCalendarAlt,
  FaUserTie,
  FaChartLine,
  FaShieldAlt,
  FaDatabase,
} from "react-icons/fa";
import { Link } from "react-router-dom";

interface StatsOverview {
  total_elections: number;
  active_elections: number;
  total_users: number;
  total_voters: number;
  total_candidates: number;
  total_votes: number;
}

const SuperAdminDashboard = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const activeToken = token || localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "elections" | "candidates" | "profile">("overview");
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/stats/overview`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load super admin stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  return (
    <div className="container py-4 my-2">
      {/* Super Admin Top Banner */}
      <div className="card shadow-sm border-0 p-4 mb-4 bg-dark text-white rounded-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-warning text-dark p-3 rounded-circle shadow">
              <FaCrown className="fs-2" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-warning text-dark px-3 py-1 text-uppercase fw-bold">
                  Super Administrator Root
                </span>
                <span className="badge bg-success-subtle text-success px-2 py-1">
                  Full Authority
                </span>
              </div>
              <h2 className="fw-bold mb-0">EVM National Electoral Command Center</h2>
              <p className="text-white-50 small mb-0">
                Root supervision of electoral integrity, officer credentialing, cryptographic ballot counting, and system policies.
              </p>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Link to="/results" className="btn btn-warning btn-sm rounded-pill px-3 py-2 fw-semibold text-dark">
              <FaChartLine className="me-1" /> Live Tally Monitor
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
        <button
          className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
            activeTab === "overview" ? "btn-dark shadow-sm" : "btn-light border"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <FaShieldAlt className="me-1" /> Root Overview
        </button>

        <button
          className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
            activeTab === "users" ? "btn-dark shadow-sm" : "btn-light border"
          }`}
          onClick={() => setActiveTab("users")}
        >
          <FaUsers className="me-1" /> User & Role Governance
        </button>

        <button
          className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
            activeTab === "elections" ? "btn-dark shadow-sm" : "btn-light border"
          }`}
          onClick={() => setActiveTab("elections")}
        >
          <FaCalendarAlt className="me-1" /> Elections Control
        </button>

        <button
          className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
            activeTab === "candidates" ? "btn-dark shadow-sm" : "btn-light border"
          }`}
          onClick={() => setActiveTab("candidates")}
        >
          <FaUserTie className="me-1" /> Candidates & Symbols
        </button>

        <button
          className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
            activeTab === "profile" ? "btn-dark shadow-sm" : "btn-light border"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Root Credentials
        </button>
      </div>

      {/* Tab: Root Overview */}
      {activeTab === "overview" && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 p-3 h-100 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Total Certified Ballots</span>
                  <div className="bg-success-subtle text-success p-2 rounded-3">
                    <FaVoteYea size={18} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">
                  {loadingStats ? "..." : stats?.total_votes ?? 0}
                </h3>
                <small className="text-success fw-medium">Encrypted & Sealed</small>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 p-3 h-100 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Elections Configured</span>
                  <div className="bg-primary-subtle text-primary p-2 rounded-3">
                    <FaCalendarAlt size={18} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">
                  {loadingStats ? "..." : stats?.total_elections ?? 0}
                </h3>
                <small className="text-muted">{stats?.active_elections ?? 0} Currently Active</small>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 p-3 h-100 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Total Citizens & Staff</span>
                  <div className="bg-warning-subtle text-warning p-2 rounded-3">
                    <FaUsers size={18} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">
                  {loadingStats ? "..." : stats?.total_users ?? 0}
                </h3>
                <small className="text-muted">Voters: {stats?.total_voters ?? 0}</small>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 p-3 h-100 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Certified Candidates</span>
                  <div className="bg-info-subtle text-info p-2 rounded-3">
                    <FaUserTie size={18} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">
                  {loadingStats ? "..." : stats?.total_candidates ?? 0}
                </h3>
                <small className="text-muted">Registered symbols validated</small>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <ElectionStatus />
            </div>
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 p-4 h-100">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <FaDatabase className="text-primary" /> System Architecture & Security Health
                </h5>
                <ul className="list-group list-group-flush small">
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Database Status:</span>
                    <span className="badge bg-success">MySQL 8.0 Connected</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Double-Vote Prevention:</span>
                    <span className="badge bg-success">Enforced (Unique Constraint)</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Password Hash Standard:</span>
                    <span className="badge bg-info text-dark">PBKDF2 : SHA-256 (1,000,000 iterations)</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Token Authentication:</span>
                    <span className="badge bg-primary">JWT HS-256 (24-Hour Expiry)</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Role Hierarchy:</span>
                    <span className="badge bg-dark">Super Admin &gt; Admin &gt; Officer &gt; Voter</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div className="row g-4">
          <div className="col-12">
            <UserManagement />
          </div>
        </div>
      )}

      {/* Tab: Elections */}
      {activeTab === "elections" && (
        <div className="row g-4">
          <div className="col-lg-6">
            <ElectionStatusSet />
          </div>
          <div className="col-lg-6">
            <ElectionStatus />
          </div>
        </div>
      )}

      {/* Tab: Candidates */}
      {activeTab === "candidates" && (
        <div className="row g-4">
          <div className="col-12">
            <ManageCandidates />
          </div>
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === "profile" && (
        <div className="row g-4">
          <div className="col-lg-8 mx-auto">
            <Profile user={user} token={activeToken || ""} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
