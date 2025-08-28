import { Link } from "react-router-dom";

const LogIn = () => {
  return (
    <>
      <div className="bg-light d-flex align-items-center justify-content-center min-vh-100">
        <div className="auth-card mx-auto">
          <div className="card p-5 shadow-sm text-center">
            <h2 className="h3 fw-bold mb-4">Log in to Your Account</h2>
            <div
              id="messageContainer"
              className="alert d-none"
              role="alert"
            ></div>
            <form id="loginForm">
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="loginEmail"
                  placeholder="Email address"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="loginPassword"
                  placeholder="Password"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-custom-green btn-lg w-100"
              >
                Log In
              </button>
            </form>
            <hr className="my-4" />
            <p className="text-muted">
              Don't have an account?
              <Link
                to="sign-up"
                id="showRegisterBtn"
                className="text-primary text-decoration-none fw-semibold"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogIn;
