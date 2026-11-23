import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import Profile from "../components/Profile";

const ProfilePage = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-4 my-2">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Profile user={user} token={token || localStorage.getItem("token") || ""} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
