import React, { useEffect } from "react";
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

    const handleLogout = async () => {
        await logout();
        navigate("/", { replace: true });
    };

    return (
        <div className="settings-mobile-container">
            <PageTitle title="Paramètre" icon={"icon-settings"} />
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

                <div className="logout-container">
                    <button className="logout-button" onClick={handleLogout}>
                        <span className="icon-btn icon-logout"></span>
                        <span className="btn-text">Se déconnecter</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingMobilePage;
