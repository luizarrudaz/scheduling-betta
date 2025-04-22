import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

const ProtectedRoute = ({
  children,
  requiredGroup,
}: {
  children: JSX.Element;
  requiredGroup?: string;
}) => {
  const { isAuthenticated, loading, groups } = useAuth();

  if (loading) return <div>Carregando...</div>;

  if (!isAuthenticated) return <Navigate to="/" />;

  if (requiredGroup && !groups.includes(requiredGroup)) {
    return <Navigate to="/access-denied" />;
  }

  return children;
};

export default ProtectedRoute;