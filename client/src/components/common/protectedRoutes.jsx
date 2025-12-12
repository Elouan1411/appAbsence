import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Layout from "../Layouts/Layout";

export function ProtectedRoutes({roles}) {
  const { user, role } = useAuth();

  console.log("user :", user, "/ Role : ", role);
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/error" replace />;
  }

return <Layout />;
}

export default ProtectedRoutes;