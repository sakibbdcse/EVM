import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../config/BaseUrl";
import { setUser, type User } from "../redux/authSlice";
import { FaLock, FaUser, FaVoteYea, FaExclamationCircle } from "react-icons/fa";

const LogIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loginId.trim() || !password) {
      setError("Please enter your login identifier and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        {
          login_id: loginId.trim(),
          password: password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const user: User = response.data.user;
      const token: string = response.data.token;

      // Dispatch to Redux (which also syncs to localStorage)
      dispatch(setUser({ user, token }));

      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ error: string }>;
        setError(axiosError.response?.data?.error || "Authentication failed. Please verify credentials.");
      } else {
        setError("Network error. Ensure the backend server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (id: string) => {
    setLoginId(id);
    setPassword("Password123!");
    setError(null);
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5 px-3">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: 480, width: "100%" }}>
        {/* Top Header */}
        <div className="bg-primary bg-gradient p-4 text-white text-center">
          <FaVoteYea className="fs-1 mb-2" />
          <h3 className="fw-bold mb-1">EVM Secure Login</h3>
          <p className="text-white-50 small mb-0">
            Sign in with your Voter ID, Username, Email, or Mobile
          </p>
        </div>

        <div className="card-body p-4 p-sm-5">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-4" role="alert">
              <FaExclamationCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">
                Username / Email / Phone
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaUser className="text-muted" />
                </span>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="form-control border-start-0"
                  placeholder="e.g. voter1, admin, or email"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-muted">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaLock className="text-muted" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control border-start-0"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 rounded-pill fw-semibold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo Quick-Fill Buttons */}
          <div className="mt-4 pt-3 border-top">
            <span className="d-block small text-muted text-center fw-semibold mb-2">
              Demo Credentials (1-Click Fill)
            </span>
            <div className="row g-2">
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm w-100 rounded-pill py-1"
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => handleQuickFill("voter1")}
                >
                  Voter: <strong>voter1</strong>
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-outline-info btn-sm w-100 rounded-pill py-1 text-dark"
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => handleQuickFill("officer")}
                >
                  Officer: <strong>officer</strong>
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm w-100 rounded-pill py-1"
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => handleQuickFill("admin")}
                >
                  Admin: <strong>admin</strong>
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm w-100 rounded-pill py-1"
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => handleQuickFill("superadmin")}
                >
                  Super: <strong>superadmin</strong>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-muted small mb-0">
              Not registered as a voter yet?{" "}
              <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
