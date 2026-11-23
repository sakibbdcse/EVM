import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import type { RootState } from "../redux/store";
import { FaVoteYea, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaChartBar, FaBars, FaTimes } from "react-icons/fa";

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [navOpen, setNavOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case "super_admin":
        return "bg-danger text-white";
      case "admin":
        return "bg-primary text-white";
      case "presiding_officer":
        return "bg-info text-dark";
      case "voter":
        return "bg-success text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "presiding_officer":
        return "Presiding Officer";
      case "voter":
        return "Voter";
      default:
        return role || "Guest";
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm sticky-top">
      <div className="container px-3 px-md-4 py-2">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary fs-4">
          <FaVoteYea className="text-primary fs-3" />
          <span>EVM Portal</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0 shadow-none p-1"
          type="button"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          {navOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>

        {/* Navigation Links */}
        <div className={`collapse navbar-collapse ${navOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-1">
            <li className="nav-item">
              <Link to="/" className="nav-link text-dark fw-medium" onClick={() => setNavOpen(false)}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/elections" className="nav-link text-dark fw-medium" onClick={() => setNavOpen(false)}>
                Elections
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/results" className="nav-link text-dark fw-medium d-flex align-items-center gap-1" onClick={() => setNavOpen(false)}>
                <FaChartBar className="text-success" /> Live Results
              </Link>
            </li>
          </ul>

          {/* User Auth Section */}
          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/dashboard"
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1 fw-semibold"
                  onClick={() => setNavOpen(false)}
                >
                  <FaTachometerAlt /> Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="d-flex align-items-center gap-2 text-decoration-none text-dark bg-light px-3 py-1 rounded-pill border"
                  onClick={() => setNavOpen(false)}
                >
                  <FaUserCircle className="text-secondary fs-5" />
                  <span className="fw-semibold text-truncate" style={{ maxWidth: 120 }}>
                    {user.first_name || user.username}
                  </span>
                  <span className={`badge rounded-pill text-uppercase px-2 ${getRoleBadgeClass(user.role)}`} style={{ fontSize: "0.68rem" }}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </Link>

                <button
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1 fw-semibold ms-lg-1"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt /> Log Out
                </button>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2 w-100 w-lg-auto">
                <Link
                  to="/login"
                  className="btn btn-outline-primary btn-sm px-3 py-1 rounded-pill fw-semibold flex-fill flex-lg-grow-0"
                  onClick={() => setNavOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm px-3 py-1 rounded-pill fw-semibold text-white flex-fill flex-lg-grow-0"
                  onClick={() => setNavOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
