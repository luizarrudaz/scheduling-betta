import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "../pages/login";
import Scheduling from "../pages/scheduling";
import AdminEvent from "../pages/admin-events";
import AdminSchedules from "../pages/admin-schedules";
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
            <ProtectedRoute requiredGroup="RH">
              <AdminEvent />
            </ProtectedRoute>
          }
        />

          <Route
          path="/agendamentos-admin"
          element={
            <ProtectedRoute requiredGroup="RH">
              <AdminSchedules />
            </ProtectedRoute>
          }
        />

        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;