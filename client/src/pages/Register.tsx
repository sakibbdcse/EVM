import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../config/BaseUrl";
import { FaUserPlus, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

interface Address {
  id: number;
  division: string;
  district: string;
  city?: string;
  village?: string;
}

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    gender: "Male",
    nid: "",
    birthdate: "",
    address_id: "",
    password: "",
    confirmPassword: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/addresses`);
        setAddresses(res.data);
      } catch (err) {
        console.error("Failed to load addresses:", err);
      }
    };
    fetchAddresses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!formData.nid.trim()) {
      setError("National ID (NID) is mandatory for voter registration.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        nid: formData.nid.trim(),
        birthdate: formData.birthdate || null,
        address_id: formData.address_id ? Number(formData.address_id) : null,
        password: formData.password,
      };

      const res = await axios.post(`${BASE_URL}/auth/register`, payload);
      setSuccess(res.data.message || "Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ error: string }>;
        setError(axiosError.response?.data?.error || "Registration failed.");
      } else {
        setError("Network error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5 px-3">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: 640, width: "100%" }}>
        {/* Header */}
        <div className="bg-primary bg-gradient p-4 text-white text-center">
          <FaUserPlus className="fs-1 mb-2" />
          <h3 className="fw-bold mb-1">Citizen Voter Registration</h3>
          <p className="text-white-50 small mb-0">
            Register your biometric & national identification to participate in electronic voting
          </p>
        </div>

        <div className="card-body p-4 p-sm-5">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-4">
              <FaExclamationCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-4">
              <FaCheckCircle className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Names */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. John"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Doe"
                  required
                />
              </div>
            </div>

            {/* Username & Email */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Choose unique username"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="voter@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone & NID */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Mobile Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. 01700000000"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">National ID (NID) *</label>
                <input
                  type="text"
                  name="nid"
                  value={formData.nid}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Unique Voter NID"
                  required
                />
              </div>
            </div>

            {/* Gender & Birthdate */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Date of Birth</label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* Constituency Address */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Voting Constituency / Address</label>
              <select
                name="address_id"
                value={formData.address_id}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">-- Select Your Voting Area --</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.division} - {a.district} {a.city ? `(${a.city})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Passwords */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Min 6 characters"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Re-type password"
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
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Submitting Registration...
                </span>
              ) : (
                "Complete Voter Registration"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted small mb-0">
              Already registered?{" "}
              <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
