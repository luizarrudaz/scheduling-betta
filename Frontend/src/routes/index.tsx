import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "../pages/login";
import Scheduling from "../pages/scheduling";
import AdminEvent from "../pages/admin-events"
import AccessDenied from "../pages/access-denied";

import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/agendamentos"
          element={
            <ProtectedRoute>
              <Scheduling />
            </ProtectedRoute>
          }
        />

        <Route
          path="/eventos"
          element={
            <ProtectedRoute>
              <AdminEvent />
            </ProtectedRoute>
          }
        />

      <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
