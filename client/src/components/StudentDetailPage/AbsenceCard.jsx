import React from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../style/Student.css";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import { useUnsaved } from "../../context/UnsavedContext";

const AbsenceCard = ({ subject, startTime, endTime, fullPeriod, justified, courseType, nom, prenom }) => {
    // const navigate = useNavigate();
    // const { hasUnsavedChanges } = useUnsaved();
    // const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    // const handleJustify = () => {
    //     safeNavigate("/dashboard/justification", {
    //         state: { prefilledPeriod: [fullPeriod] },
    //     });
    // };

    return (
        <div className={`card-absence`}>
            <div className="card-absence-left">
                <div className={`selection-checkbox-wrapper`}>
                    {/* <div className="selection-checkbox">{isSelected && <Check size={14} color="white" strokeWidth={4} />}</div> */}
                </div>

                <div className="card-absence-info">
                    <div className="card-absence-header">
                        <h3 className="card-absence-subject">
                            {subject} ({courseType}){" "}
                            <span>
                                avec {prenom} {nom.toUpperCase()}
                            </span>
                        </h3>
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
            <div>
                <span className={justified ? "justification-badge justified-badge" : "justification-badge no-justified-badge"}>
                    {justified ? "Justifiée" : "Non justifiée"}
                </span>
            </div>

            {/* <div className="card-absence-right">
                <div className={`action-button-wrapper ${isSelectionMode ? "hidden" : ""}`}>
                    <button className="btn-justifier" onClick={handleJustify}>
                        Justifier
                    </button>
                </div>
            </div> */}
        </div>
    );
};

export default AbsenceCard;
