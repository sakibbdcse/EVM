import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { FaCalendarAlt, FaVoteYea, FaChartBar, FaSearch, FaCheckCircle, FaClock } from "react-icons/fa";

interface ElectionItem {
  id: number;
  title: string;
  description: string;
  address_id: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status: "upcoming" | "ongoing" | "ended" | "inactive";
  candidate_count: number;
  vote_count: number;
  address?: {
    division?: string;
    district?: string;
    city?: string;
    village?: string;
  };
}

const ElectionsList = () => {
  const [elections, setElections] = useState<ElectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/elections`);
        setElections(res.data);
      } catch (err) {
        console.error("Failed to load elections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  const filtered = elections.filter((e) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && e.is_active && e.status === "ongoing") ||
      (statusFilter === "upcoming" && e.status === "upcoming") ||
      (statusFilter === "ended" && (e.status === "ended" || !e.is_active));
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.address?.division && e.address.division.toLowerCase().includes(q)) ||
      (e.address?.district && e.address.district.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <span className="badge bg-secondary">Inactive</span>;
    }
    switch (status) {
      case "ongoing":
        return <span className="badge bg-success d-flex align-items-center gap-1"><FaCheckCircle /> Live & Active</span>;
      case "upcoming":
        return <span className="badge bg-info text-dark d-flex align-items-center gap-1"><FaClock /> Upcoming</span>;
      case "ended":
        return <span className="badge bg-dark">Concluded</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container py-4 my-2">
      {/* Header */}
      <div className="card shadow-sm border-0 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <FaCalendarAlt className="text-primary" /> Elections Directory
            </h2>
            <p className="text-muted small mb-0">
              Browse current and upcoming official elections, voting schedules, and candidates.
            </p>
          </div>

          {user?.role && user.role !== "voter" && (
            <Link to="/dashboard" className="btn btn-primary btn-sm rounded-pill px-3 py-2 fw-semibold">
              + Manage / Create Elections
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="row g-2 mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search elections by title, constituency or region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Elections ({elections.length})</option>
            <option value="active">Active & Open for Voting</option>
            <option value="upcoming">Upcoming</option>
            <option value="ended">Concluded</option>
          </select>
        </div>
      </div>

      {/* Elections Cards */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2">Loading elections...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-light text-center py-5 border">
          <h5>No elections found</h5>
          <p className="text-muted small mb-0">Try adjusting your search criteria or filter options.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((el) => (
            <div key={el.id} className="col-lg-6">
              <div className="card h-100 shadow-sm border-0 p-4 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    {getStatusBadge(el.status, el.is_active)}
                  </div>
                  <span className="badge bg-light text-secondary border">
                    ID #{el.id}
                  </span>
                </div>

                <h4 className="fw-bold text-dark mb-2">{el.title}</h4>
                <p className="text-muted small mb-3 flex-grow-1">
                  {el.description || "General democratic election event for public representation."}
                </p>

                {/* Constituency and stats */}
                <div className="bg-light p-3 rounded-3 mb-3 small">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Constituency:</span>
                    <span className="fw-semibold">
                      {el.address ? `${el.address.division}, ${el.address.district}` : "National"}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Nominated Candidates:</span>
                    <span className="fw-semibold text-primary">{el.candidate_count}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Total Ballots Cast:</span>
                    <span className="fw-semibold text-success">{el.vote_count}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Voting Window:</span>
                    <span className="text-muted">
                      {new Date(el.start_date).toLocaleDateString()} - {new Date(el.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2 pt-2 border-top">
                  {el.is_active && el.status === "ongoing" && (
                    <Link
                      to="/dashboard"
                      className="btn btn-success btn-sm rounded-pill flex-fill fw-semibold d-flex align-items-center justify-content-center gap-1"
                    >
                      <FaVoteYea /> Cast Vote
                    </Link>
                  )}
                  <Link
                    to={`/results?election_id=${el.id}`}
                    className="btn btn-outline-primary btn-sm rounded-pill flex-fill fw-semibold d-flex align-items-center justify-content-center gap-1"
                  >
                    <FaChartBar /> View Results
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElectionsList;
