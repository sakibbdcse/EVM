import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL, getImageUrl } from "../config/BaseUrl";
import { FaTrophy, FaChartBar, FaSync, FaVoteYea, FaExclamationCircle } from "react-icons/fa";

interface CandidateResult {
  id: number;
  election_id: number;
  user_id: number;
  name: string;
  username: string;
  party: string;
  slogan: string;
  symbol?: string;
  symbol_url?: string;
  photo_url?: string;
  votes: number;
  percentage: number;
}

interface ResultsResponse {
  election: {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    status: string;
    location: string;
  };
  total_votes: number;
  winner: {
    status: string;
    candidate_id?: number;
    name?: string;
    party?: string;
    votes?: number;
    percentage?: number;
    top_votes?: number;
    candidates?: string[];
  } | null;
  candidates: CandidateResult[];
}

interface ElectionOption {
  id: number;
  title: string;
  is_active: boolean;
}

const Results = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const electionIdParam = searchParams.get("election_id");

  const [data, setData] = useState<ResultsResponse | null>(null);
  const [elections, setElections] = useState<ElectionOption[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>(electionIdParam || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Fetch election list for dropdown
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/elections`);
        setElections(res.data);
        if (!selectedElectionId && res.data.length > 0) {
          // Default to first active or first election
          const active = res.data.find((e: ElectionOption) => e.is_active) || res.data[0];
          setSelectedElectionId(String(active.id));
        }
      } catch (err) {
        console.error("Failed to load elections:", err);
      }
    };
    fetchElections();
  }, [selectedElectionId]);

  // Fetch results
  const fetchResults = useCallback(async () => {
    if (!selectedElectionId) return;
    try {
      const res = await axios.get(`${BASE_URL}/elections/${selectedElectionId}/results`);
      setData(res.data);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to fetch results.");
      } else {
        setError("Error loading results.");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedElectionId]);

  useEffect(() => {
    if (selectedElectionId) {
      fetchResults();
    }
  }, [selectedElectionId, fetchResults]);

  // Auto-refresh interval (every 5 seconds if enabled)
  useEffect(() => {
    if (!autoRefresh || !selectedElectionId) return;
    const interval = setInterval(() => {
      fetchResults();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedElectionId, fetchResults]);

  const handleElectionChange = (id: string) => {
    setSelectedElectionId(id);
    setSearchParams({ election_id: id });
  };

  return (
    <div className="container py-4 my-2">
      {/* Top Banner & Selector */}
      <div className="card shadow-sm border-0 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <FaChartBar className="text-primary" /> Official Election Results & Live Tally
            </h2>
            <p className="text-muted small mb-0">
              Real-time cryptographic vote counting and certified election metrics.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <select
              className="form-select form-select-sm w-auto"
              value={selectedElectionId}
              onChange={(e) => handleElectionChange(e.target.value)}
            >
              {elections.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.title} {el.is_active ? "(Live Active)" : ""}
                </option>
              ))}
            </select>

            <button
              className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-1"
              onClick={fetchResults}
              title="Refresh Count"
            >
              <FaSync className={loading ? "fa-spin" : ""} /> Refresh
            </button>

            <div className="form-check form-switch ms-2 mb-0">
              <input
                type="checkbox"
                className="form-check-input"
                id="autoRefreshSwitch"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <label htmlFor="autoRefreshSwitch" className="form-check-label small text-muted">
                Live Auto-Update (5s)
              </label>
            </div>
          </div>
        </div>
      </div>

      {loading && !data ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2">Tabulating live ballots...</p>
        </div>
      ) : error ? (
        <div className="alert alert-warning text-center py-4">
          <FaExclamationCircle className="fs-3 mb-2 text-warning" />
          <h5>{error}</h5>
          <p className="text-muted small">Please select an election with nominated candidates.</p>
        </div>
      ) : data ? (
        <>
          {/* Election Info Bar */}
          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <div className="card shadow-sm border-0 p-3 h-100">
                <span className="badge bg-primary text-uppercase px-2 py-1 align-self-start mb-2">
                  {data.election.status}
                </span>
                <h4 className="fw-bold mb-1">{data.election.title}</h4>
                <p className="text-muted small mb-2">{data.election.description || "General Electoral Race"}</p>
                <div className="text-secondary small">
                  <strong>Location:</strong> {data.election.location} | <strong>Voting Window:</strong>{" "}
                  {new Date(data.election.start_date).toLocaleDateString()} -{" "}
                  {new Date(data.election.end_date).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0 p-3 h-100 bg-primary bg-gradient text-white text-center d-flex flex-column justify-content-center">
                <FaVoteYea className="fs-1 mx-auto mb-2 opacity-75" />
                <h6 className="text-white-50 text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>
                  Total Certified Ballots Cast
                </h6>
                <h2 className="display-6 fw-bold mb-0">{data.total_votes}</h2>
                <small className="text-white-50 mt-1">
                  Updated {lastRefreshed.toLocaleTimeString()}
                </small>
              </div>
            </div>
          </div>

          {/* Winner Banner if available */}
          {data.winner && (
            <div className="card shadow-sm border-0 border-start border-4 border-warning p-4 mb-4 bg-warning-subtle">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning text-dark p-3 rounded-circle shadow-sm">
                  <FaTrophy className="fs-3" />
                </div>
                <div>
                  <span className="badge bg-warning text-dark text-uppercase px-2 py-1 mb-1">
                    {data.winner.status === "won" ? "Certified Election Winner" : "Leading Candidate"}
                  </span>
                  <h4 className="fw-bold text-dark mb-0">
                    {data.winner.name} ({data.winner.party})
                  </h4>
                  <p className="text-muted small mb-0">
                    Secured <strong>{data.winner.votes} votes</strong> ({data.winner.percentage}% of total ballots cast)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Candidate Breakdown */}
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold text-dark mb-4">Ballot Standings & Vote Distribution</h5>

            {data.candidates.length === 0 ? (
              <div className="alert alert-light text-center py-4 border">
                No candidates recorded in this election.
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {data.candidates.map((c, index) => (
                  <div key={c.id} className="p-3 rounded-3 border bg-light">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                      <div className="d-flex align-items-center gap-3">
                        <span className="badge bg-secondary rounded-circle p-2" style={{ width: 28, height: 28 }}>
                          #{index + 1}
                        </span>

                        <img
                          src={
                            c.photo_url
                              ? getImageUrl(c.photo_url)
                              : "https://placehold.co/45x45/e2e8f0/475569?text=C"
                          }
                          alt={c.name}
                          className="rounded-circle border"
                          style={{ width: 48, height: 48, objectFit: "cover" }}
                        />

                        {c.symbol_url && (
                          <img
                            src={getImageUrl(c.symbol_url)}
                            alt="Symbol"
                            className="rounded-circle border border-warning"
                            style={{ width: 40, height: 40, objectFit: "contain", backgroundColor: "#fff" }}
                            title="Candidate Symbol"
                          />
                        )}

                        <div>
                          <h6 className="fw-bold mb-0 text-dark">{c.name}</h6>
                          <span className="badge bg-primary-subtle text-primary fw-semibold me-2">
                            {c.party || "Independent"}
                          </span>
                          {c.slogan && <small className="text-muted fst-italic">"{c.slogan}"</small>}
                        </div>
                      </div>

                      <div className="text-end">
                        <h5 className="fw-bold text-primary mb-0">{c.votes} Votes</h5>
                        <span className="badge bg-light text-dark border">{c.percentage}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress rounded-pill" style={{ height: 14 }}>
                      <div
                        className={`progress-bar progress-bar-striped ${
                          index === 0 ? "bg-success" : "bg-primary"
                        }`}
                        role="progressbar"
                        style={{ width: `${c.percentage}%` }}
                        aria-valuenow={c.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Results;
