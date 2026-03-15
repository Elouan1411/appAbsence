import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import toggleTheme from "../functions/toggleTheme";
import { useNavigate } from "react-router-dom";
import { isAndroid, isIOS } from "react-device-detect";
import "../style/SettingsMobilePage.css";
import "../style/VerticalBar.css";
import PageTitle from "../components/common/PageTitle";
import PWAInstallModal from "../components/common/PWAInstallModal";

const SettingMobilePage = () => {
    const { logout, role } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();
    const isDarkMode = theme === "dark";
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    useEffect(() => {
        if (sessionStorage.getItem("pwa_auto_refresh")) {
            sessionStorage.removeItem("pwa_auto_refresh");
            if (isIOS) {
                // Sur iOS (Apple), on ouvre directement la popup tutoriel après le refresh
                setIsModalOpen(true);
            } else {
                import("react-hot-toast").then((module) => {
                    module.default.success("Prêt ! Cliquez à nouveau pour installer.", { duration: 4000 });
                });
            }
        }
    }, []);

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
                            <span className="icon icon-sun" title="Mode clair"></span>
                            <span>Clair</span>
                        </div>
                        <div className={`toggle-option ${isDarkMode ? "active" : ""}`}>
                            <span className="icon icon-moon" title="Mode sombre"></span>
                            <span>Sombre</span>
                        </div>
                    </button>
                </div>

                <div className="logout-container" style={{ marginBottom: "10px" }}>
                    <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                    <button
                        id="install-pwa-btn"
                        className="logout-button"
                        onClick={() => {
                            const currentPrompt = window.deferredPrompt || deferredPrompt;

                            if (currentPrompt) {
                                sessionStorage.removeItem("pwa_auto_refresh");
                                currentPrompt.prompt().catch(() => {
                                    // Some browsers block auto-prompts. Optional toast notification here if needed.
                                });
                                currentPrompt.userChoice.then((choiceResult) => {
                                    if (choiceResult.outcome === "accepted") {
                                        setDeferredPrompt(null);
                                        window.deferredPrompt = null;
                                    }
                                });
                            } else {
                                const isMobileView = window.innerWidth <= 768;
                                const hasRefreshed = sessionStorage.getItem("pwa_auto_refresh");

                                if (isIOS) {
                                    // Sur iOS, l'event n'existe pas, refresh inutile
                                    setIsModalOpen(true);
                                } else if ((isAndroid || isMobileView) && !hasRefreshed) {
                                    sessionStorage.setItem("pwa_auto_refresh", "true");
                                    window.location.reload();
                                } else {
                                    sessionStorage.removeItem("pwa_auto_refresh");
                                    setIsModalOpen(true);
                                }
                            }
                        }}
                        style={{ backgroundColor: "var(--text-primary)" }}
                    >
                        <span className="icon-btn icon-download" style={{ backgroundColor: "var(--sidebar-bg)" }} title="Télécharger"></span>
                        <span className="btn-text" style={{ color: "var(--sidebar-bg)" }}>
                            Installer l'application
                        </span>
                    </button>
                </div>

                <div className="logout-container">
                    <button className="logout-button" onClick={handleLogout}>
                        <span className="icon-btn icon-logout" style={{ backgroundColor: "white" }} title="Déconnexion"></span>
                        <span style={{ color: "white" }}>Se déconnecter</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingMobilePage;
