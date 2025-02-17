import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/login";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Adicione outras rotas aqui */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
