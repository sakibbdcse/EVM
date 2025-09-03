import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../redux/store";

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg shadow-sm bg-light">
      <div className="container-fluid px-4 py-2">
        <a className="navbar-brand fw-bold text-primary fs-4" href="/">
          Online Voting System
        </a>

        <div className="ms-auto d-flex align-items-center gap-3">
          {user && (
            <span className="fw-semibold text-dark">{user.username}</span>
          )}

          <button
            className="btn btn-custom-danger rounded-3 fw-semibold"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
