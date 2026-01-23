import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./hooks/useAuth";
import ErrorPage from "./pages/ErrorPage";
import { routesConfig } from "./routes.config.jsx";
import ProtectedRoutes from "./components/common/protectedRoutes";
import "./App.css";
import { Toaster } from "react-hot-toast";
import { useTheme } from "./hooks/useTheme.js";

function App() {
    const { user, role, loading } = useAuth();
    const theme = useTheme();

    console.log("user : ", user, "/ role: ", role);
    if (loading) {
        return <div className="loading">En chargement</div>;
    }

    return (
        <>
            <Routes>
                <Route path="/" element={!user ? <LoginPage /> : <Navigate to={getHomeRoute(role)} replace />} />

                {routesConfig.map((section, index) => (
                    <Route key={index} path={section.path} element={<ProtectedRoutes allowedRoles={section.allowedRoles} />}>
                        {section.children.map((child, childIndex) => (
                            <Route key={childIndex} index={child.index} path={child.path} element={child.element} />
                        ))}
                    </Route>
                ))}

                <Route path="/error" element={<ErrorPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    style: {
                        margin: 10,
                        ...(theme === "dark" ? { backgroundColor: "#2a2a30", color: "#FFF" } : {}),
                    },
                }}
            />
        </>
    );
}

const getHomeRoute = (role) => {
    switch (role) {
        case "admin":
            return "/admin";
        case "teacher":
            return "/teacher";
        case "student":
            return "/dashboard";
        default:
            return "/";
    }
};

export default App;
