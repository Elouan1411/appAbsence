import "../style/Skeleton.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useState } from "react";
import {
  FiUser,
  FiLogOut,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const LOGOUT_URL = "/logout";

function Skeleton({ children, nav }) {
  const { auth, setAuth } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const disconnect = async (e) => {
    const response = await fetch(LOGOUT_URL, {
      method: "POST",
      withCredentials: true,
    });
    setAuth(null);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h1 className="app-title">Suivi des absences</h1>
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        {/* {nav && (
                    <nav className="sidebar-nav">
                        <ul>
                            {nav.map((item) => (
                                <li key={item.text} className={isActive(item.url) ? "selected" : ""}>
                                    <Link to={item.url}>
                                        <span className="nav-icon">
                                            {item.text === "Justifications" && "📋"}
                                            {item.text === "Importer" && "📤"}
                                            {item.text === "Consulter" && "🔍"}
                                            {item.text === "Appel" && "📝"}
                                            {!["Justifications", "Importer", "Consulter", "Appel"].includes(item.text) && "📄"}
                                        </span>
                                        <span className="nav-text">{item.text}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
                
                <div className="sidebar-footer">
                    {auth != undefined && auth.role != undefined && (
                        <>
                            <div className="user-info">
                                <div className="user-icon">
                                    <FiUser />
                                </div>
                                <div className="user-details">
                                    <span className="user-role">{auth.role}</span>
                                </div>
                            </div>
                            <button className="logout-button" onClick={disconnect}>
                                <span className="nav-icon"><FiLogOut /></span>
                                <span className="nav-text">Déconnexion</span>
                            </button>
                        </>
                    )}
                </div> */}
      </aside>

      {/* Main content */}
      <div className="content-wrapper">
        <main className="content">{children}</main>

        <footer className="content-footer">
          <p>© {new Date().getFullYear()} Suivi des absences</p>
        </footer>
      </div>
    </div>
  );
}

export default Skeleton;
