import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { routesConfig } from '../../../routes.config';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import '../../../style/VerticalBar.css';


function VerticalBar({ notificationCount = 0 }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleSignOut = async () => {
        console.log("ok");
        await logout();
        navigate("/", { replace: true });

        try {
        } catch (error) {}
    };
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = sessionStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        sessionStorage.setItem('theme', theme);
        document.body.className = theme;
    }, [isDarkMode]);
    const { role } = useAuth(); 

    const currentRoleConfig = routesConfig.find(route => route.allowedRoles.includes(role));
    const menuLinks = currentRoleConfig ? currentRoleConfig.children : [];

    const getIconClass = (label) => {
        return `icon-${label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')}`;
    };

    return (
        <nav className={`sidebar ${isMenuOpen ? "open" : ""} ${isDarkMode ? "dark" : "light"}`}>
            
            <button className="vertical-bar-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <span className="icon-toggle"></span>
            </button>
            
            <div className="nav-container">
                <ul className="nav-list">
                    {menuLinks.map((link, index) => {
                        const to = link.index ? currentRoleConfig.path : `${currentRoleConfig.path}/${link.path}`;
                        
                        return (
                            <li key={index} className='nav-item'>
                                <NavLink to={to} end={link.index} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                    <span className={`icon ${getIconClass(link.label)}`}></span>
                                    <span className="label">{link.label}</span>
                                    
                                    {!isMenuOpen && <span className="tooltip">{link.label}</span>}
                                </NavLink>
                            </li>
                        )
                    })}
                </ul>

                <div className="sidebar-footer">
                    <ul className="nav-list">
                        <li className="nav-item">
                            <Link to="/notifications" className="nav-link">
                                <span className="icon icon-notification"></span>
                                <span className="label">Notification</span>
                                {isMenuOpen && notificationCount > 0 && <span className="badge">{notificationCount}</span>}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/settings" className="nav-link">
                                <span className="icon icon-settings"></span>
                                <span className="label">Settings</span>
                            </Link>
                        </li>
                    </ul>

                    <div className="theme-toggle-container">
                        <button 
                            className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
                            onClick={() => setIsDarkMode(!isDarkMode)}
                        >
                            <div className={`toggle-option ${!isDarkMode ? 'active' : ''}`}>
                                <span className="icon icon-sun"></span>
                                {isMenuOpen && <span>Light</span>}
                            </div>
                            <div className={`toggle-option ${isDarkMode ? 'active' : ''}`}>
                                <span className="icon icon-moon"></span>
                                {isMenuOpen && <span>Dark</span>}
                            </div>
                        </button>
                    </div>

                    <div className="logout-container">
                        <button className="nav-link logout-btn" onClick={handleSignOut}>
                            <span className="icon icon-logout"></span>
                            <span className="label">Log out</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default VerticalBar;