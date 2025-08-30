import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";

import VoterDashboard from "./VoterDashboard";
import OfficerDashboard from "./OfficerDashboard";
import AdminDashboard from "./AdminDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";
import type { RootState } from "../redux/store";
import { logout, setUser, type User } from "../redux/authSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchUser = async () => {
      const localToken = token || localStorage.getItem("token");
      if (!localToken) {
        alert("No token found. Please login.");
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/user/current-user`, {
          headers: { Authorization: `Bearer ${localToken}` },
        });

        dispatch(setUser({ user: response.data as User, token: localToken }));
      } catch (err) {
        console.error("Fetch user failed:", err);
        alert("Failed to fetch user. Please login again.");
        dispatch(logout());
      }
    };

    if (!user) fetchUser();
  }, [dispatch, token, user]);

  if (!user)
    return <p className="text-center mt-5">Loading or User not found...</p>;

  return (
    <div className="container mt-4">
      <h2>
        Welcome, {user.first_name} {user.last_name} ({user.username})
      </h2>
      <p>
        Role: <strong>{user.role}</strong>
      </p>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>NID: {user.nid}</p>
      <p>Gender: {user.gender}</p>
      <p>Birth Date: {user.birthdate}</p>
      <p>Verified: {user.is_verified ? "Yes" : "No"}</p>

      {user.role === "voter" && <VoterDashboard />}
      {user.role === "presiding_officer" && <OfficerDashboard />}
      {user.role === "admin" && <AdminDashboard />}
      {user.role === "superadmin" && <SuperAdminDashboard />}
    </div>
  );
};

export default Dashboard;
