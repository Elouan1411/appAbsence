import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import toggleTheme from "../functions/toggleTheme";
import { useNavigate } from "react-router-dom";
import "../style/SettingsMobilePage.css";
import "../style/VerticalBar.css";
import PageTitle from "../components/common/PageTitle";

const SettingMobilePage = () => {
    const { logout, role } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();
    const isDarkMode = theme === "dark";
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 725) {
                navigate("/", { replace: true });
            }
        };

        // Check initially
        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [navigate]);

    useEffect(() => {
        if (window.deferredPrompt) {
            setDeferredPrompt(window.deferredPrompt);
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            window.deferredPrompt = e;
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
            window.deferredPrompt = null;
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/", { replace: true });
    };

    return (
        <div className="settings-mobile-container">
            <PageTitle title="Paramètres" icon={"icon-settings"} />
            <div className="settings-mobile-subcontainer">
                <h3>Changez le thème de l'application</h3>
                <div className="theme-toggle-container">
                    <button className={`theme-toggle ${isDarkMode ? "dark" : "light"}`} onClick={toggleTheme}>
                        <div className={`toggle-option ${!isDarkMode ? "active" : ""}`}>
                            <span className="icon icon-sun"></span>
                            <span>Clair</span>
                        </div>
                        <div className={`toggle-option ${isDarkMode ? "active" : ""}`}>
                            <span className="icon icon-moon"></span>
                            <span>Sombre</span>
                        </div>
                    </button>
                </div>

                    <div className="logout-container" style={{ marginBottom: "10px" }}>
                        <button className="logout-button" onClick={handleInstallClick} style={{ backgroundColor: "var(--text-primary)" }}>
                            <span className="icon-btn icon-download" style={{ backgroundColor: "var(--sidebar-bg)" }}></span>
                            <span className="btn-text" style={{ color: "var(--sidebar-bg)" }}>
                                Installer l'application
                            </span>
                        </button>
                    </div>

                <div className="logout-container">
                    <button className="logout-button" onClick={handleLogout}>
                        <span className="icon-btn icon-logout" style={{ backgroundColor: "white" }}></span>
                        <span style={{ color: "white" }}>Se déconnecter</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingMobilePage;
