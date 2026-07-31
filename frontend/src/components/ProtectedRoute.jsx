import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Redirect users based on their role
export function homeForRole(role) {
  switch (role) {
    case "employee":
      return "/employee";
    case "manager":
      return "/manager";
    case "admin":
      return "/manager"; // Change to "/admin" if you create an admin dashboard
    default:
      return "/login";
  }
}

export default function ProtectedRoute({ roles, children }) {
  const { user, isAuthenticated } = useAuth();

  // User is not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // User does not have permission for this route
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  // Authorized
  return children;
}