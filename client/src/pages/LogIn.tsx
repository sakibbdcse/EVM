import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../config/BaseUrl";

interface LoginData {
  loginId: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
}

const LogIn = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<LoginData>({
    loginId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.loginId || !data.password) {
      setError("Login ID and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        {
          login_id: data.loginId,
          password: data.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const user: User = response.data.user;
      const token: string = response.data.token;

      // Save token and user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert(response.data.message || "Login successful!");
      navigate("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ error: string }>;
        setError(axiosError.response?.data?.error || "Network error");
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light d-flex align-items-center justify-content-center min-vh-100">
      <div className="auth-card mx-auto">
        <div className="card p-5 shadow-sm text-center">
          <h2 className="h3 fw-bold mb-4">Log in to Your Account</h2>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                name="loginId"
                value={data.loginId}
                onChange={handleChange}
                className="form-control"
                placeholder="Username, Email or Phone"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                name="password"
                value={data.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-custom-green btn-lg w-100"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <hr className="my-4" />
          <p className="text-muted">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary text-decoration-none fw-semibold"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
