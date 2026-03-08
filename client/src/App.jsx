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
import { getHomeRoute } from "./utils/roleUtils.js";

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
        // native comportment for pull to refresh doesnt work so we implement a clone of it (problem : overflow-y: auto)
        // we use : https://developer.mozilla.org/fr/docs/Web/API/Touch_events
        let startY = 0;
        let startX = 0;
        let isPulling = false;
        let ptrElement = null;
        let ptrIcon = null;

        const maxPullDistance = 120; // Maximum visual pull distance
        const threshold = 100; // Pull amount to trigger refresh

        const initPTR = () => {
            if (document.getElementById("custom-ptr-element")) return;

            ptrElement = document.createElement("div");
            ptrElement.id = "custom-ptr-element";
            ptrElement.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="var(--primary-color)"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`;

            Object.assign(ptrElement.style, {
                position: "fixed",
                top: "10px",
                left: "50%",
                transform: "translate(-50%, -60px) rotate(0deg)",
                width: "40px",
                height: "40px",
                background: "white",
                borderRadius: "50%",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: "9999",
                opacity: "0",
                pointerEvents: "none",
                transition: "opacity 0.2s, transform 0s",
            });

            ptrIcon = ptrElement.querySelector("svg");
            Object.assign(ptrIcon.style, {
                transition: "transform 0s",
            });

            document.body.appendChild(ptrElement);

            if (!document.getElementById("ptr-spin-style")) {
                const style = document.createElement("style");
                style.id = "ptr-spin-style";
                style.innerHTML = `
                    @keyframes ptrspin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
        };

        const handleTouchStart = (e) => {
            let target = e.target;
            let isScrolled = false;

            while (target && target !== document.body && target !== document.documentElement) {
                if (target.scrollTop > 0) {
                    isScrolled = true;
                    break;
                }
                target = target.parentNode;
            }

            if (window.scrollY > 0 || document.documentElement.scrollTop > 0) {
                isScrolled = true;
            }

            if (!isScrolled && e.touches.length === 1) {
                startY = e.touches[0].clientY;
                startX = e.touches[0].clientX;
                isPulling = true;
                initPTR();

                if (ptrElement) {
                    ptrElement.style.transition = "opacity 0.2s, transform 0s";
                }
            } else {
                isPulling = false;
            }
        };

        const handleTouchMove = (e) => {
            if (!isPulling || !ptrElement) return;

            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;

            const deltaY = currentY - startY;
            const deltaX = Math.abs(currentX - startX);

            if (deltaY < 0 || deltaX > deltaY) {
                if (deltaY < -10) {
                    isPulling = false;
                    resetPTR();
                }
                return;
            }

            const pullAmount = Math.min(deltaY * 0.4, maxPullDistance);

            if (pullAmount > 10) {
                ptrElement.style.opacity = Math.min((pullAmount - 10) / 40, 1).toString();
                ptrElement.style.transform = `translate(-50%, ${pullAmount - 40}px)`;
                ptrIcon.style.transform = `rotate(${pullAmount * 3}deg)`;
            } else {
                ptrElement.style.opacity = "0";
            }
        };

        const handleTouchEnd = () => {
            if (!isPulling || !ptrElement) return;
            isPulling = false;

            const transformMatch = ptrElement.style.transform.match(/translate\(-50%, ([-0-9.]+)px\)/);
            const currentY = transformMatch ? parseFloat(transformMatch[1]) : -60;

            if (currentY + 40 >= threshold * 0.4) {
                ptrElement.style.transition = "transform 0.3s ease-out, opacity 0.2s";
                ptrElement.style.transform = "translate(-50%, 40px)";
                ptrIcon.style.animation = "ptrspin 1s linear infinite";

                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                resetPTR();
            }
        };

        const resetPTR = () => {
            if (!ptrElement) return;
            ptrElement.style.transition = "transform 0.3s ease-out, opacity 0.2s";
            ptrElement.style.transform = "translate(-50%, -60px)";
            ptrElement.style.opacity = "0";

            setTimeout(() => {
                if (ptrElement) {
                    ptrElement.style.transition = "opacity 0.2s, transform 0s";
                }
            }, 300);
        };

        document.addEventListener("touchstart", handleTouchStart, { passive: true });
        document.addEventListener("touchmove", handleTouchMove, { passive: true });
        document.addEventListener("touchend", handleTouchEnd, { passive: true });
        document.addEventListener("touchcancel", handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
            document.removeEventListener("touchcancel", handleTouchEnd);
            const el = document.getElementById("custom-ptr-element");
            if (el) el.remove();
        };
    }, []);

    useEffect(() => {
        const viewportMeta = document.querySelector("meta[name='viewport']");
        if (viewportMeta) {
            if (location.pathname.startsWith("/admin") && !location.pathname.includes("/appel")) {
                if (window.screen.width < 1200) {
                    viewportMeta.setAttribute("content", "width=1200, user-scalable=yes, viewport-fit=cover");
                } else {
                    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0, viewport-fit=cover");
                }
            } else {
                viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0, viewport-fit=cover");
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

export default App;
