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
  FaVoteYea,
  FaUsers,
  FaCalendarAlt,
  FaUserTie,
  FaChartLine,
  FaCog,
  FaList,
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

const AdminDashboard = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const activeToken = token || localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState<"overview" | "elections" | "candidates" | "users" | "profile">("overview");
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/stats/overview`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch overview stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  return (
    <div className="container py-4 my-2">
      {/* Admin Header */}
      <div className="card shadow-sm border-0 p-4 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary px-3 py-1 text-uppercase">
                {user.role.replace("_", " ")}
              </span>
              <h2 className="fw-bold text-dark mb-0">Electoral Administration Hub</h2>
            </div>
            <p className="text-muted small mb-0">
              Complete oversight of elections, candidate certifications, user permissions, and certified tallies.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link to="/results" className="btn btn-outline-success btn-sm rounded-pill px-3 py-2 fw-semibold">
              <FaChartLine className="me-1" /> Live Results Monitor
            </Link>
            <Link to="/elections" className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 fw-semibold">
              <FaList className="me-1" /> Public Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
        <button
          className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
            activeTab === "overview" ? "btn-primary shadow-sm" : "btn-light border"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <FaChartLine className="me-1" /> System Metrics
        </button>

        <button
          className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
            activeTab === "elections" ? "btn-primary shadow-sm" : "btn-light border"
          }`}
          onClick={() => setActiveTab("elections")}
        >
          <FaCalendarAlt className="me-1" /> Elections Management
        </button>

        <button
          className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
            activeTab === "candidates" ? "btn-primary shadow-sm" : "btn-light border"
          }`}
          onClick={() => setActiveTab("candidates")}
        >
          <FaUserTie className="me-1" /> Candidates & Symbols
        </button>

        <button
          className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
            activeTab === "users" ? "btn-primary shadow-sm" : "btn-light border"
          }`}
          onClick={() => setActiveTab("users")}
        >
          <FaUsers className="me-1" /> Citizens & Staff
        </button>

        <button
          className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
            activeTab === "profile" ? "btn-primary shadow-sm" : "btn-light border"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <FaCog className="me-1" /> Admin Profile
        </button>
      </div>

      {/* Tab: Overview Metrics */}
      {activeTab === "overview" && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 p-3 h-100 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Total Ballots Cast</span>
                  <div className="bg-success-subtle text-success p-2 rounded-3">
                    <FaVoteYea size={18} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">
                  {loadingStats ? "..." : stats?.total_votes ?? 0}
                </h3>
                <small className="text-success fw-medium">Certified Electronic Ballots</small>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 p-3 h-100 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Registered Voters</span>
                  <div className="bg-primary-subtle text-primary p-2 rounded-3">
                    <FaUsers size={18} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">
                  {loadingStats ? "..." : stats?.total_voters ?? 0}
                </h3>
                <small className="text-muted">Total Accounts: {stats?.total_users ?? 0}</small>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 p-3 h-100 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Active Elections</span>
                  <div className="bg-warning-subtle text-warning p-2 rounded-3">
                    <FaCalendarAlt size={18} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">
                  {loadingStats ? "..." : stats?.active_elections ?? 0}
                </h3>
                <small className="text-muted">Total Sessions: {stats?.total_elections ?? 0}</small>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 p-3 h-100 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Nominated Candidates</span>
                  <div className="bg-info-subtle text-info p-2 rounded-3">
                    <FaUserTie size={18} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">
                  {loadingStats ? "..." : stats?.total_candidates ?? 0}
                </h3>
                <small className="text-muted">Across all constituencies</small>
              </div>
            </div>
          </div>

          {/* Current Active Election Quick Preview */}
          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <ElectionStatus />
            </div>
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 p-4 h-100">
                <h5 className="fw-bold text-primary mb-3">Quick Actions</h5>
                <div className="d-flex flex-column gap-2">
                  <button
                    className="btn btn-outline-primary text-start p-3 rounded-3 d-flex justify-content-between align-items-center"
                    onClick={() => setActiveTab("elections")}
                  >
                    <div>
                      <span className="fw-bold d-block">Create or Schedule Election</span>
                      <small className="text-muted">Setup dates, title, constituency bounds</small>
                    </div>
                    <FaCalendarAlt className="text-primary" />
                  </button>

                  <button
                    className="btn btn-outline-success text-start p-3 rounded-3 d-flex justify-content-between align-items-center"
                    onClick={() => setActiveTab("candidates")}
                  >
                    <div>
                      <span className="fw-bold d-block">Manage Candidates & Symbols</span>
                      <small className="text-muted">Nominate candidates and verify electoral symbols</small>
                    </div>
                    <FaUserTie className="text-success" />
                  </button>

                  <button
                    className="btn btn-outline-secondary text-start p-3 rounded-3 d-flex justify-content-between align-items-center"
                    onClick={() => setActiveTab("users")}
                  >
                    <div>
                      <span className="fw-bold d-block">Provision Officer & Admin Accounts</span>
                      <small className="text-muted">Control roles and review voter registrations</small>
                    </div>
                    <FaUsers className="text-secondary" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab: Elections Management */}
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

      {/* Tab: Candidates Management */}
      {activeTab === "candidates" && (
        <div className="row g-4">
          <div className="col-12">
            <ManageCandidates />
          </div>
        </div>
      )}

      {/* Tab: User Management */}
      {activeTab === "users" && (
        <div className="row g-4">
          <div className="col-12">
            <UserManagement />
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

export default AdminDashboard;
