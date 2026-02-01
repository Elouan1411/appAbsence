import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { routesConfig } from "../../../routes.config";
import { NavLink, Link, useNavigate, useLocation, matchPath } from "react-router-dom";
import "../../../style/VerticalBar.css";
import getIconClass from "../../../functions/getIconClass";
import NavItem from "./NavItem";
import React from "react";
import { useSafeNavigate } from "../../../hooks/useSafeNavigate";
import { useTheme } from "../../../hooks/useTheme";
import toggleTheme from "../../../functions/toggleTheme";

function VerticalBar({ notificationCount = 0 }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const theme = useTheme();
    const isDarkMode = theme === "dark";
    const hasUnsavedImport = false;
    const safeNavigate = useSafeNavigate(hasUnsavedImport);

    const handleSignOut = async () => {
        await logout();
        navigate("/", { replace: true });
    };

    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const { role } = useAuth();

    const currentRoleConfig = routesConfig.find((route) => route.allowedRoles.includes(role));
    const menuLinks = currentRoleConfig ? currentRoleConfig.children : [];

    const [lastActivePath, setLastActivePath] = useState(null);

    useEffect(() => {
        if (!menuLinks || !currentRoleConfig) return;

        let activeFound = null;

        const isLinkVisible = (link) => {
            if (link.path === "settings") return true; 
            if (link.path === "absence/:id" && !location.pathname.includes("/absence/")) return false;
            if (!link.label) return false;
            if (link.path?.includes("studentdetail") || link.path?.includes("absencedetail")) return false;
            return true;
        };

        for (const link of menuLinks) {
            if (!isLinkVisible(link)) continue;

            const to = link.index ? currentRoleConfig.path : `${currentRoleConfig.path}/${link.path}`;
            if (matchPath({ path: to, end: link.index }, location.pathname)) {
                activeFound = to;
                break;
            }
        }

        if (activeFound) {
            setLastActivePath(activeFound);
        } else if (!lastActivePath) {
            let pathToCheck = location.pathname;
            let found = null;

            while (pathToCheck.length > 1 && !found) {
                for (const link of menuLinks) {
                    if (!isLinkVisible(link)) continue;
                    const to = link.index ? currentRoleConfig.path : `${currentRoleConfig.path}/${link.path}`;
                    if (to === pathToCheck) {
                        found = to;
                        break;
                    }
                }
                if (found) break;
                
                const lastSlash = pathToCheck.lastIndexOf("/");
                if (lastSlash <= 0) break;
                pathToCheck = pathToCheck.substring(0, lastSlash);
            }

            if (found) {
                setLastActivePath(found);
            } else {
                 const indexLink = menuLinks.find((l) => l.index);
                 if (indexLink) {
                     setLastActivePath(currentRoleConfig.path);
                 }
            }
        }
    }, [location.pathname, menuLinks, currentRoleConfig, lastActivePath, role]);

    return (
        <nav className={`sidebar ${isMenuOpen ? "open" : ""} ${isDarkMode ? "dark" : "light"}`}>
            <button className="vertical-bar-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <span className="icon-toggle"></span>
            </button>

            <div className="nav-container">
                <ul className="nav-list">
                    {menuLinks.map((link, index) => {
                        if (link.path === "absence/:id" && !location.pathname.includes("/absence/")) return null;
                        if (!link.label) return null;

                        const isMobileItem = link.path === "settingsmobile";

                        const wrapperClass = `nav-wrapper ${isMobileItem ? "mobile-only-item" : ""}`;
                        if (!link.path?.includes("studentdetail") && !link.path?.includes("absencedetail")) {
                            const to = link.index ? currentRoleConfig.path : `${currentRoleConfig.path}/${link.path}`;

                            return (
                                <div key={index} className={wrapperClass}>
                                    <NavItem 
                                        link={link} 
                                        index={index} 
                                        to={to} 
                                        isMenuOpen={isMenuOpen} 
                                        isActiveOverride={lastActivePath === to}
                                    />
                                </div>
                            );
                        }
                    })}
                </ul>

                <div className="sidebar-footer">
                    {role === "admin" && (
                        <li className="nav-item">
                            <NavLink
                                to="/admin/settings"
                                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                onClick={(e) => {
                                    e.preventDefault();
                                    safeNavigate("/admin/settings");
                                }}
                            >
                                <span className="icon-nav icon-settings"></span>
                                <span className="label">Paramètres</span>
                            </NavLink>
                        </li>
                    )}

                    <div className="theme-toggle-container">
                        <button className={`theme-toggle ${isDarkMode ? "dark" : "light"}`} onClick={toggleTheme}>
                            <div className={`toggle-option ${!isDarkMode ? "active" : ""}`}>
                                <span className="icon-nav icon-sun"></span>
                                {isMenuOpen && <span>Clair</span>}
                            </div>
                            <div className={`toggle-option ${isDarkMode ? "active" : ""}`}>
                                <span className="icon-nav icon-moon"></span>
                                {isMenuOpen && <span>Sombre</span>}
                            </div>
                        </button>
                    </div>

                    <div className="logout-container">
                        <button className="nav-link logout-btn" onClick={handleSignOut}>
                            <span className="icon-nav icon-logout"></span>
                            <span className="label">Se déconnecter</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default VerticalBar;
