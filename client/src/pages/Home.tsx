import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Candidate from "../components/Candidate";
import ElectionStatus from "../components/ElectionStatus";

import type { RootState } from "../redux/store";
import { logout, setUser, type User } from "../redux/authSlice";
import { BASE_URL } from "../config/BaseUrl";
import ElectionStatusSet from "../components/ElectionStatusSet";
import ManageCandidates from "../components/ManageCandidates";
import Profile from "../components/Profile";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const localToken = token || localStorage.getItem("token");

    if (!localToken) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/current-user`, {
          headers: { Authorization: `Bearer ${localToken}` },
        });

        dispatch(setUser({ user: response.data as User, token: localToken }));
      } catch (err) {
        console.error("Fetch user failed:", err);
        dispatch(logout());
        navigate("/login");
      }
    };

    if (!user) fetchUser();
  }, [dispatch, navigate, token, user]);

  if (!user)
    return <p className="text-center mt-5">Loading or User not found...</p>;

  return (
    <div className="container my-5 flex-grow-1">
      <h1 className="display-4 fw-bold mb-3 text-center">
        {user.role} Dashboard
      </h1>

      {/* Election Countdown */}
      <div className="row mb-4">
        {user.role === "voter" ? (
          <ElectionStatus />
        ) : user.role === "admin" ? (
          <ElectionStatusSet />
        ) : user.role === "presiding_officer" ? (
          <ElectionStatusSet />
        ) : (
          <div>No Role Assigned</div>
        )}
      </div>

      <div className="row">
        {/* Profile Section */}
        <Profile user={user} token={token || ""} />
        {/* Active Elections */}

        <div className="col-md-6 mb-4">
          {user.role === "voter" ? (
            <div className="card p-4 shadow-sm h-100">
              <h5 className="fw-bold text-success mb-3">Active Elections</h5>
              <p className="text-muted">
                Click on a candidate to cast your vote.
              </p>
              <div className="row">
                <Candidate />
                <Candidate />
                <Candidate />
              </div>
            </div>
          ) : user.role === "admin" ? (
            <div className="card p-4 shadow-sm h-100">
              <ManageCandidates />
            </div>
          ) : user.role === "presiding_officer" ? (
            <div className="card p-4 shadow-sm h-100">
              <ManageCandidates />
            </div>
          ) : (
            <div className="card p-4 shadow-sm h-100">
              <h5 className="fw-bold text-muted mb-3">No Role Assigned</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
