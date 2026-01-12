import React from "react";
import { Check } from "lucide-react";
import "../../style/Student.css";

const AbsenceCard = ({ subject, startTime, endTime, isSelectionMode, isSelected, onToggle }) => {
    return (
        <div
            className={`card-absence ${isSelectionMode ? "selection-mode" : ""} ${isSelected ? "selected" : ""}`}
            onClick={isSelectionMode ? onToggle : undefined}
        >
            <div className="card-absence-left">
                <div className={`selection-checkbox-wrapper ${isSelectionMode ? "visible" : ""}`}>
                    <div className="selection-checkbox">{isSelected && <Check size={14} color="white" strokeWidth={4} />}</div>
                </div>

                <div className="card-absence-info">
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
            </div>

            <div className="card-absence-right">
                <div className={`action-button-wrapper ${isSelectionMode ? "hidden" : ""}`}>
                    <button className="btn-justifier">Justifier</button>
                </div>
            </div>
        </div>
    );
};

export default AbsenceCard;
