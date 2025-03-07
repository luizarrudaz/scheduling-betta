import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Agendamento from "../pages/agendamento";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/agendamento" element={<Agendamento />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
