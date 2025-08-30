import { Routes, Route } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Register from "../pages/Register";
import LogIn from "../pages/LogIn";
import PresidingOfficerDashboard from "../pages/OfficerDashboard";
import Dashboard from "../pages/Dashboard";
const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LogIn />} />
        <Route
          path="/officer-dashboard"
          element={<PresidingOfficerDashboard />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default Router;
