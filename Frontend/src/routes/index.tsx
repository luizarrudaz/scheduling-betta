import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Scheduling from "../pages/scheduling";
import AdminEvent from "../pages/admin-events"

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/agendamentos" element={<Scheduling />} />
        <Route path="/eventos" element={<AdminEvent />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
