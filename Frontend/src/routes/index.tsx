import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Scheduling from "../pages/Scheduling";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/agendamento" element={<Scheduling />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
