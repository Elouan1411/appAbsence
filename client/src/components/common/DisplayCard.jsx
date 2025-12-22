import React, { useRef, useState } from "react";
import "../../style/DisplayCard.css";


export default function DisplayCard({ title, value, iconLink, style = {} }) {
    return (
        <div className="display-card" style={style}>
            <span
                className="display-card-icon"
                style={{ '--icon-link': `url(${iconLink})` }}
            >
            </span>
            <div className="display-card-content">
                <p className="display-card-title">{title}</p>
                <p className="display-card-value">{value}</p>
            </div>
        </div>
    );
}