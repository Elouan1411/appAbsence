import React from 'react';
import "../../style/icon.css";

const BackButton = ({ onClick, label = "Retour", className = "" }) => {
    return (
        <button onClick={onClick} className={`back ${className}`}>
            <span className="icon icon-big icon-previous"/>
            {label}
        </button>
    );
};

export default BackButton;
