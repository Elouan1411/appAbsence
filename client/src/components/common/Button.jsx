import React from "react";

export default function Button({ children, onClick, disabled = false, className = "", type = "button" }) {
    return (
        <button type={type} variant="contained" className={`button ${className}`} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
}
