import React from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../style/Student.css";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import { useUnsaved } from "../../context/UnsavedContext";

const AbsenceCard = ({ subject, startTime, endTime, fullPeriod, isSelectionMode, isSelected, onToggle, status = "todo" }) => {
    const navigate = useNavigate();
    const { hasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    const handleJustify = () => {
        safeNavigate("/dashboard/justification", {
            state: { prefilledPeriod: [fullPeriod] },
        });
    };

    const badgeText = status === "todo" ? "Action requise" : status === "pending" ? "En attente de validation" : "Archivé";
    const badgeClass = status === "todo" ? "card-absence-badge" : "card-absence-badge pending";

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
                        <span className={badgeClass}>{badgeText}</span>
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
                    {status === "todo" && (
                        <button className="btn-justifier" onClick={handleJustify}>
                            Justifier
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AbsenceCard;
