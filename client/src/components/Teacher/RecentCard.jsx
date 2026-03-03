import React from "react";
import "../../style/RecentCard.css";
import "../../style/icon.css";

function RecentCard({ promo, group, subject, date, onClick }) {
    return (
        <div className="recent-card">
            <div className="recent-card-info-row">
                <span className="icon icon-promo" style={{ width: 20, height: 20 }} title="Promotion" ></span>
                <span>{promo}</span>
            </div>
            
            <div className="recent-card-info-row">
                <span className="icon icon-group" style={{ width: 20, height: 20 }} title="Groupe" ></span>
                <span>{group}</span>
            </div>
            
            <div className="recent-card-info-row">
                <span className="icon icon-subject" style={{ width: 20, height: 20 }} title="Matière" ></span>
                <span>{subject}</span>
            </div>

            <div className="divider"></div>

            <div className="recent-card-footer">
                <span className="recent-card-date">{date}</span>
                <button className="recent-card-action" onClick={onClick}>
                    Faire l'appel →
                </button>
            </div>
        </div>
    );
}

export default RecentCard;
