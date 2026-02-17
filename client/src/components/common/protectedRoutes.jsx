import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Layout from "../Layouts/Layout";
import { getHomeRoute } from "../../utils/roleUtils";

export function ProtectedRoutes({ allowedRoles }) {
    const { user, role } = useAuth();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to={getHomeRoute(role)} replace />;
    }

    return <Layout />;
}

export default ProtectedRoutes;
