import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";
import VoterDashboard from "./VoterDashboard";
import OfficerDashboard from "./OfficerDashboard";
import AdminDashboard from "./AdminDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";
import type { RootState } from "../redux/store";
import { logout, setUser, type User } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      navigate("/login");
      return;
    }

    if (!user) {
      const fetchCurrentUser = async () => {
        try {
          const res = await axios.get(`${BASE_URL}/user/current-user`, {
            headers: { Authorization: `Bearer ${activeToken}` },
          });
          dispatch(setUser({ user: res.data as User, token: activeToken }));
        } catch (err) {
          console.error("Failed to rehydrate current user:", err);
          dispatch(logout());
          navigate("/login");
        } finally {
          setLoading(false);
        }
      };
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [dispatch, navigate, token, user]);

  if (loading || !user) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
        <h5 className="fw-bold text-dark">Initializing Secure Dashboard</h5>
        <p className="text-muted small">Verifying voter credentials and retrieving system state...</p>
      </div>
    );
  }

  switch (user.role) {
    case "super_admin":
      return <SuperAdminDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "presiding_officer":
      return <OfficerDashboard />;
    case "voter":
    default:
      return <VoterDashboard />;
  }
};

export default Dashboard;
