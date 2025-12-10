import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function ProtectedRoute({ children, roles }) {
  const { user, role } = useAuth();

  console.log("user :", user, "/ Role : ", role);
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/error" replace />;
  }

  return children;
}
