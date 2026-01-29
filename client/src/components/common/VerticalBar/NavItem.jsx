import React from "react";
import { NavLink } from "react-router-dom";
import getIconClass from "../../../functions/getIconClass";
import { useSafeNavigate } from "../../../hooks/useSafeNavigate";
import { useUnsaved } from "../../../context/UnsavedContext";
import { useLocation } from "react-router-dom";

function NavItem({ link, index, to, isMenuOpen, isActiveOverride }) {
    const { hasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);
    const location = useLocation();
    const iconName = link.icon || getIconClass(link.label);
    return (
        <li key={index} className="nav-item">
            <NavLink
                to={to}
                end={link.index}
                className={({ isActive }) => (isActive || isActiveOverride ? "nav-link active" : "nav-link")}
                onClick={(e) => {
                    e.preventDefault();
                    if (location.pathname === to) {
                        window.location.reload();
                        return;
                    }
                    safeNavigate(to);
                }}
            >
                <span className={`icon-nav ${iconName}`}></span>
                <span className="label">{link.label}</span>

                {!isMenuOpen && <span className="tooltip">{link.label}</span>}
            </NavLink>
        </li>
    );
}

export default NavItem;
