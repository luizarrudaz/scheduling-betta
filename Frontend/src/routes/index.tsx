import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Scheduling from "../pages/scheduling";

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
