import { useState } from "react";
import { Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../config/BaseUrl";
import { useNavigate } from "react-router-dom";
// Main form data type (excluding confirm password)
interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  gender: string;
  nid: string;
  birthdate: string;
  password: string;
}

// Separate type for password + confirm
interface PasswordInput {
  password: string;
  confirm: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    gender: "",
    nid: "",
    birthdate: "",
    password: "",
  });

  const [passwordInput, setPasswordInput] = useState<PasswordInput>({
    password: "",
    confirm: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "password" || name === "confirmPassword") {
      setPasswordInput((prev) => ({
        ...prev,
        [name === "password" ? "password" : "confirm"]: value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordInput.password !== passwordInput.confirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const submitData = { ...formData, password: passwordInput.password };

      const response = await axios.post(`${BASE_URL}/register`, submitData);

      alert(response.data.message || "Registration successful!");
      console.log("✅ User registered:", response.data);
      navigate("/login");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        alert(axiosError.response?.data?.error || axiosError.message);
        console.error("❌ Registration failed:", axiosError);
      } else {
        console.error(error);
        alert("Something went wrong!");
      }
    }
  };

  return (
    <div className="bg-light d-flex align-items-center justify-content-center min-vh-100">
      <div className="auth-card mx-auto">
        <div className="card p-5 shadow-sm text-center">
          <h2 className="h3 fw-bold mb-4">Create Your Account</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Email address"
                required
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Username"
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Phone Number"
                  required
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <select
                  className="form-select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-6">
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Date of Birth"
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="nid"
                value={formData.nid}
                onChange={handleChange}
                className="form-control"
                placeholder="NID"
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                name="password"
                value={passwordInput.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Password"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                name="confirmPassword"
                value={passwordInput.confirm}
                onChange={handleChange}
                className="form-control"
                placeholder="Confirm Password"
                required
              />
            </div>

            <button type="submit" className="btn btn-custom-green btn-lg w-100">
              Register
            </button>
          </form>

          <hr className="my-4" />
          <p className="text-muted">
            Already have an account?{" "}
            <Link
              to="/login" // ✅ make sure route matches your router
              className="text-primary text-decoration-none fw-semibold"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
