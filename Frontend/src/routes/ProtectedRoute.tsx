import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { JSX } from "react";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredGroup?: string;
}

const ProtectedRoute = ({ children, requiredGroup }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, groups } = useAuthContext();

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/" />;

  if (requiredGroup) {
    const hasAccess = groups.some(
      g => g.trim().toUpperCase() === requiredGroup.trim().toUpperCase()
    );

    if (!hasAccess) return <Navigate to="/access-denied" />;
  }

  return children;
};

export default ProtectedRoute;