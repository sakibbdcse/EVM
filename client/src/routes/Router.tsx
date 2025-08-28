import { Routes, Route } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Register from "../pages/Register";
import LogIn from "../pages/LogIn";
const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="/sign-up" element={<Register />} />
        <Route path="/login" element={<LogIn />} />
      </Route>
    </Routes>
  );
};

export default Router;
