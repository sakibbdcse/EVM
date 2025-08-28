import { Link } from "react-router-dom";

const Register = () => {
  return (
    <>
      <div className="bg-light d-flex align-items-center justify-content-center min-vh-100">
        <div className="auth-card mx-auto">
          <div className="card p-5 shadow-sm text-center">
            <h2 className="h3 fw-bold mb-4">Create Your Account</h2>
            <div
              id="messageContainer"
              className="alert d-none"
              role="alert"
            ></div>
            <form id="registerForm">
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="registerEmail"
                  placeholder="Email address"
                  required
                />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    id="registerFirstName"
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    id="registerLastName"
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    id="registerUsername"
                    placeholder="Username"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="tel"
                    className="form-control"
                    id="registerPhoneNumber"
                    placeholder="Phone Number"
                    required
                  />
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <select className="form-select" id="registerGender" required>
                    <option value="" disabled selected>
                      Select Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    id="registerAddress"
                    placeholder="Address"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="registerPassword"
                  placeholder="Password"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-custom-green btn-lg w-100"
              >
                Register
              </button>
            </form>
            <hr className="my-4" />
            <p className="text-muted">
              Already have an account?
              <Link
                to="sign-up"
                id="showLoginBtn"
                className="text-primary text-decoration-none fw-semibold"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
