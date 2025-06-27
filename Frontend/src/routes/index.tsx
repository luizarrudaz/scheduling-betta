import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "../pages/login";
import Events from "../pages/events";
import Schedulings from "../pages/user-schedules";
import AdminEvents from "../pages/admin-events";
import AdminSchedules from "../pages/admin-schedules";
import AccessDenied from "../pages/access-denied";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/eventos"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agendamentos"
          element={
            <ProtectedRoute>
              <Schedulings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/eventos-admin"
          element={
            <ProtectedRoute requiredGroup="RH">
              <AdminEvents />
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