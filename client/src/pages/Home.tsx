import { useDispatch, useSelector } from "react-redux";
import Candidate from "../components/Candidate";
import type { RootState } from "../redux/store";
import { logout, setUser, type User } from "../redux/authSlice";
import { useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";
import ElectionStatus from "../components/ElectionStatus";
const Home = () => {
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
    <>
      <div className="container my-5 flex-grow-1">
        <h1 className="display-4 fw-bold mb-3 text-center">Voter Dashboard</h1>
        <div className="row mb-4">
          <ElectionStatus />
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow-sm h-100 position-relative">
              <h5 className="fw-bold text-success mb-3">Your Profile</h5>
              <button
                className="btn btn-sm btn-outline-success position-absolute top-0 end-0 m-3"
                onClick={() => console.log("Edit clicked")}
              >
                Edit
              </button>

              <div className="text-center mb-3">
                <img
                  className="profile-photo"
                  alt="Voter Photo"
                  src="/images/profavater.jpg"
                />
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Name:
                  <span className="text-muted">
                    {user.first_name} {user.last_name} ({user.username})
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Email:
                  <span className="text-muted">{user.email}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Phone:
                  <span className="text-muted text-end">{user.phone}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  NID:
                  <span className="text-muted text-end">{user.nid}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Gender:
                  <span className="text-muted text-end">{user.gender}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Birthdate:
                  <span className="text-muted text-end">{user.birthdate}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Address:
                  <span className="text-muted text-end">
                    123 Main Street, Anytown, State, 12345
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Role:
                  <span className="badge bg-warning">{user.role}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Status:
                  <span className="badge bg-success" id="votingStatus">
                    Eligible to Vote
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-6 mb-4">
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
