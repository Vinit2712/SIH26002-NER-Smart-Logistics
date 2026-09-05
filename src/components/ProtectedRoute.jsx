import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps a page and only renders it if the logged-in user has the right role.
// Otherwise redirects to /login.

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();

  if (!user || user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;