import React from "react";
import "../../style/Student.css";

const AbsenceCard = ({ subject, startTime, endTime }) => {
    return (
        <div className="card-absence">
            <div className="card-absence-left">
                <div className="card-absence-header">
                    <h3 className="card-absence-subject">{subject}</h3>
                    <span className="card-absence-badge">Action requise</span>
                </div>
                <div className="card-absence-time">
                    <div className="time-block">
                        <span className="time-label">DÉBUT</span>
                        <span className="time-value">{startTime}</span>
                    </div>
                    <div className="time-block">
                        <span className="time-label">FIN</span>
                        <span className="time-value">{endTime}</span>
                    </div>
                </div>
            </div>

            <div className="card-absence-right">
                <button className="btn-justifier">Justifier</button>
            </div>
        </div>
    );
};

export default AbsenceCard;
