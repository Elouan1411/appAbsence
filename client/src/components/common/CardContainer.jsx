import React from "react";
import "../../style/CardContainer.css";

export default function CardContainer({ children }) {
    return (
        <div className="card-container">
            {children}
        </div>
    );
}