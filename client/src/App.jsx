import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./hooks/useAuth";
import ErrorPage from "./pages/ErrorPage";
import { routesConfig } from "./routes.config.jsx";
import ProtectedRoutes from "./components/common/protectedRoutes";
import "./App.css";
import { Toaster } from "react-hot-toast";
import { useTheme } from "./hooks/useTheme.js";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

function App() {
    const { user, role, loading } = useAuth();
    const theme = useTheme();
    const location = useLocation();

    const [progress, setProgress] = useState(0);
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        let interval;
        let timeout;

        if (loading) {
            interval = setInterval(() => {
                setProgress((oldProgress) => {
                    if (oldProgress >= 90) return 90;
                    const diff = Math.random() * 10;
                    return Math.min(oldProgress + diff, 90);
                });
            }, 200);
        } else {
            if (interval) clearInterval(interval);
            setProgress(100);

            timeout = setTimeout(() => {
                setIsAppReady(true);
            }, 500);
        }

        return () => {
            if (interval) clearInterval(interval);
            if (timeout) clearTimeout(timeout);
        };
    }, [loading]);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    useEffect(() => {
        const viewportMeta = document.querySelector("meta[name='viewport']");
        if (viewportMeta) {
            if (location.pathname.startsWith("/admin") && !location.pathname.includes("/rollcall")) {
                if (window.screen.width < 1200) {
                    viewportMeta.setAttribute("content", "width=1200, user-scalable=yes");
                } else {
                    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0");
                }
            } else {
                viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0");
            }
        }
    }, [location]);

    if (!isAppReady) {
        const isDark = theme === "dark";
        return (
            <div className="loading-screen">
                <h1>Application de gestion des Absences</h1>
                <div className="progress-container">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        );
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
