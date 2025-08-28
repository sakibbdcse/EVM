import { Routes, Route } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Register from "../pages/Register";
const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="/sign-up" element={<Register />} />
      </Route>
    </Routes>
  );
};

export default Router;
