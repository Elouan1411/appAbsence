import React from "react";
import { NavLink } from "react-router-dom";
import getIconClass from "../../../functions/getIconClass";

function NavItem({ link, index, to, isMenuOpen }) {
    const iconName = link.icon || getIconClass(link.label);
    return (
        <li key={index} className="nav-item">
            <NavLink to={to} end={link.index} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                <span className={`icon ${iconName}`}></span>
                <span className="label">{link.label}</span>

                {!isMenuOpen && <span className="tooltip">{link.label}</span>}
            </NavLink>
        </li>
    );
}

export default NavItem;
