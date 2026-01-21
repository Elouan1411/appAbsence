import React from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../style/Student.css";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import { useUnsaved } from "../../context/UnsavedContext";
import { Eye } from "lucide-react";

const AbsenceCard = ({
    id,
    subject,
    startTime,
    endTime,
    fullPeriod,
    fullPeriodGroup,
    isSelectionMode,
    isSelected,
    onToggle,
    status = "todo",
    reason,
    adminComment,
    justificationId,
    dateDemande,
}) => {
    const navigate = useNavigate();
    const { hasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    const [reason_split, comment_split] = typeof reason === "string" ? reason.split(" | ") : ["", ""];
    console.log("reason_split :", reason_split);
    console.log("comment_split :", comment_split);

    const handleJustify = () => {
        safeNavigate("/dashboard/justification", {
            state: { prefilledPeriod: [fullPeriod] },
        });
    };

    const handleDetails = (e) => {
        e.stopPropagation();
        safeNavigate(`/dashboard/absence/${id}`, {
            state: {
                prefilledPeriod: fullPeriodGroup || [fullPeriod],
                reason: reason,
                adminComment: adminComment,
                justificationId: justificationId,
                dateDemande: dateDemande,
            },
        });
    };

    const getBadgeInfo = () => {
        switch (status) {
            case "todo":
                let text = adminComment ? "Justificatif incomplet" : "Action requise";
                return { text: text, className: "card-absence-badge" };
            case "pending":
                return { text: "En attente de validation", className: "card-absence-badge pending" };
            case "validated":
                return { text: "Justifiée", className: "card-absence-badge validated" };
            case "refused":
                return { text: "Refusée", className: "card-absence-badge refused" };
            default:
                return { text: "Archivé", className: "card-absence-badge" };
        }
    };

    const { text: badgeText, className: badgeClass } = getBadgeInfo();

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
                    {(adminComment || reason) && (
                        <div title={adminComment || reason}>
                            <div className="card-absence-reason">
                                <span className="reason-label">{adminComment ? "Remarque :" : "Motif :"}</span>
                                <span className="reason-text">{adminComment || reason_split}</span>
                            </div>
                            {!adminComment && comment_split !== "" && comment_split !== undefined && (
                                <div className="card-absence-reason">
                                    <span className="reason-label">{"Commentaire :"}</span>
                                    <span className="reason-text">{comment_split}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="card-absence-right">
                <div className={`action-button-wrapper ${isSelectionMode ? "hidden" : ""}`}>
                    <Eye className="icon-eye details-icon" onClick={handleDetails} />
                    {status === "todo" && (
                        <button className="btn-justifier" onClick={handleJustify}>
                            {adminComment ? "Modifier" : "Justifier"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AbsenceCard;
