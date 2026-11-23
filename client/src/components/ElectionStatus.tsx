import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BASE_URL } from "../config/BaseUrl";
import { useSelector } from "react-redux";
import { FaClock, FaCheckCircle, FaExclamationCircle, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import type { RootState } from "../redux/store";

export type Election = {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean | number;
  status: "upcoming" | "ongoing" | "ended" | "inactive";
  candidate_count?: number;
  vote_count?: number;
  address?: {
    division?: string;
    district?: string;
    city?: string;
    village?: string;
  };
};

type TimeLeft = {
  expired: boolean;
  notStarted: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

interface ElectionStatusProps {
  electionId?: number;
  onSelectElection?: (election: Election) => void;
}

const ElectionStatus: React.FC<ElectionStatusProps> = ({ electionId }) => {
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    expired: false,
    notStarted: false,
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const { user } = useSelector((state: RootState) => state.auth);

  const fetchElection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = electionId
        ? `${BASE_URL}/elections/${electionId}`
        : `${BASE_URL}/elections/active`;
      const res = await axios.get(endpoint);
      setElection(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "No election found");
      } else {
        setError("Error loading election details");
      }
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    fetchElection();
  }, [fetchElection]);

  // Countdown timer calculation
  useEffect(() => {
    if (!election) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const startTime = new Date(election.start_date).getTime();
      const endTime = new Date(election.end_date).getTime();

      if (now < startTime) {
        const diff = startTime - now;
        const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0");
        const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
        const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0");
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
        setTimeLeft({ expired: false, notStarted: true, days, hours, minutes, seconds });
      } else if (now > endTime) {
        setTimeLeft({ expired: true, notStarted: false, days: "00", hours: "00", minutes: "00", seconds: "00" });
      } else {
        const diff = endTime - now;
        const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0");
        const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
        const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0");
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
        setTimeLeft({ expired: false, notStarted: false, days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [election]);

  if (loading) {
    return (
      <div className="card shadow-sm p-4 text-center">
        <div className="spinner-border text-primary mx-auto mb-2" role="status">
          <span className="visually-hidden">Loading election...</span>
        </div>
        <p className="text-muted mb-0">Loading election status...</p>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="card shadow-sm p-4 text-center border-warning">
        <FaExclamationCircle className="text-warning fs-2 mx-auto mb-2" />
        <h5 className="fw-bold mb-1">No Active Election Right Now</h5>
        <p className="text-muted small mb-3">
          Check back soon or browse previous elections from the elections list.
        </p>
        <Link to="/elections" className="btn btn-outline-primary btn-sm mx-auto">
          Browse All Elections
        </Link>
      </div>
    );
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="card shadow-sm border-0 overflow-hidden">
      {/* Header bar */}
      <div className="bg-primary bg-gradient text-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <FaCalendarAlt className="fs-5" />
          <span className="fw-bold fs-6">Official Electoral Event</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          {election.is_active ? (
            <span className="badge bg-success d-flex align-items-center gap-1 px-2 py-1">
              <FaCheckCircle /> Active
            </span>
          ) : (
            <span className="badge bg-secondary px-2 py-1">Inactive</span>
          )}
          <span className="badge bg-light text-dark text-capitalize px-2 py-1">
            {election.status}
          </span>
        </div>
      </div>

      <div className="p-4 text-center">
        <h3 className="fw-bold text-dark mb-2">{election.title}</h3>
        {election.description && (
          <p className="text-muted mb-3 mx-auto" style={{ maxWidth: 650 }}>
            {election.description}
          </p>
        )}

        {election.address && (
          <div className="badge bg-light text-secondary border px-3 py-2 mb-3">
            Constituency / Region: {election.address.division}, {election.address.district}
            {election.address.city ? ` (${election.address.city})` : ""}
          </div>
        )}

        {/* Countdown Timer Block */}
        <div className="bg-light p-3 rounded-4 my-3 border">
          <div className="d-flex justify-content-center align-items-center gap-2 mb-2 text-primary fw-semibold">
            <FaClock />
            <span>
              {timeLeft.notStarted
                ? "Election Starts In:"
                : timeLeft.expired
                ? "Election Closed"
                : "Election Closes In:"}
            </span>
          </div>

          {!timeLeft.expired ? (
            <div className="d-flex justify-content-center gap-2 gap-sm-3">
              <div className="bg-white p-2 p-sm-3 rounded-3 shadow-sm text-center" style={{ minWidth: 65 }}>
                <span className="h3 fw-bold text-primary d-block mb-0">{timeLeft.days}</span>
                <small className="text-muted fw-semibold" style={{ fontSize: "0.7rem" }}>DAYS</small>
              </div>
              <div className="h3 fw-bold my-auto text-muted">:</div>
              <div className="bg-white p-2 p-sm-3 rounded-3 shadow-sm text-center" style={{ minWidth: 65 }}>
                <span className="h3 fw-bold text-primary d-block mb-0">{timeLeft.hours}</span>
                <small className="text-muted fw-semibold" style={{ fontSize: "0.7rem" }}>HOURS</small>
              </div>
              <div className="h3 fw-bold my-auto text-muted">:</div>
              <div className="bg-white p-2 p-sm-3 rounded-3 shadow-sm text-center" style={{ minWidth: 65 }}>
                <span className="h3 fw-bold text-primary d-block mb-0">{timeLeft.minutes}</span>
                <small className="text-muted fw-semibold" style={{ fontSize: "0.7rem" }}>MINS</small>
              </div>
              <div className="h3 fw-bold my-auto text-muted">:</div>
              <div className="bg-white p-2 p-sm-3 rounded-3 shadow-sm text-center" style={{ minWidth: 65 }}>
                <span className="h3 fw-bold text-danger d-block mb-0">{timeLeft.seconds}</span>
                <small className="text-muted fw-semibold" style={{ fontSize: "0.7rem" }}>SECS</small>
              </div>
            </div>
          ) : (
            <div className="alert alert-secondary mb-0 py-2">
              Voting has formally concluded for this election. Final results are now available.
            </div>
          )}

          <div className="row g-2 mt-3 pt-2 border-top text-muted small">
            <div className="col-sm-6 text-sm-start">
              <strong>Opens:</strong> {formatDateTime(election.start_date)}
            </div>
            <div className="col-sm-6 text-sm-end">
              <strong>Closes:</strong> {formatDateTime(election.end_date)}
            </div>
          </div>
        </div>

        {/* Quick Links & Results */}
        <div className="d-flex justify-content-center gap-2 mt-3">
          <Link
            to={`/results?election_id=${election.id}`}
            className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-2 fw-semibold"
          >
            <FaChartBar /> View Live Results
          </Link>
          {user?.role && user.role !== "voter" && (
            <Link
              to="/dashboard"
              className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 fw-semibold"
            >
              Election Control Panel
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectionStatus;
