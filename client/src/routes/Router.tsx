import { Routes, Route, Link } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Register from "../pages/Register";
import LogIn from "../pages/LogIn";
import Dashboard from "../pages/Dashboard";
import Results from "../pages/Results";
import ElectionsList from "../pages/ElectionsList";
import ProfilePage from "../pages/ProfilePage";
import ProtectedRoute from "../components/ProtectedRoute";

const NotFound = () => (
  <div className="container py-5 text-center my-5">
    <h1 className="display-1 fw-bold text-muted">404</h1>
    <h3 className="fw-bold mb-3">Page Not Found</h3>
    <p className="text-muted mb-4">The page or resource you requested does not exist.</p>
    <Link to="/" className="btn btn-primary rounded-pill px-4">
      Return to Home
    </Link>
  </div>
);

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<LogIn />} />
        <Route path="register" element={<Register />} />
        <Route path="elections" element={<ElectionsList />} />
        <Route path="results" element={<Results />} />

        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Router;
