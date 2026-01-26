import React from "react";
// import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../style/Student.css";
import "../../style/StudentMobile.css";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import { useUnsaved } from "../../context/UnsavedContext";

import trashIcon from "../../assets/trash.svg";
import { alertConfirm } from "../../hooks/alertConfirm";
import toast from "react-hot-toast";

const AbsenceCard = ({
    id,
    subject,
    teacher,
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
    onDelete,
}) => {
    const navigate = useNavigate();
    const { hasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    const [reason_split, comment_split] = typeof reason === "string" ? reason.split(" | ") : ["", ""];

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
                status: status,
            },
        });
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        const confirmation = await alertConfirm("Suppression d'une justification", "Êtes-vous sûr de vouloir supprimer cette justification ?");
        console.log("Delete triggered for justificationId:", justificationId);
        if (confirmation.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/justification/${justificationId}`, {
                    method: "DELETE",
                    credentials: "include",
                });

                console.log("apres api");

                if (response.ok) {
                    toast.success("Justification supprimée");
                    onDelete(justificationId);
                } else {
                    toast.error("Erreur lors de la suppression");
                }
                console.log("ca a marché");
            } catch (error) {
                console.log("ca a pas marché");
                console.error(error);
                toast.error("Erreur serveur");
            }
        } else {
            toast.error("Suppression annulée");
        }
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
                    <div className="selection-checkbox">
                        {isSelected && (
                            // <Check size={14} color="white" strokeWidth={4} />
                            <span className="icon icon-check" style={{ width: 14, height: 14, backgroundColor: "white" }} />
                        )}
                    </div>
                </div>

                <div className="card-absence-info">
                    <div className="card-absence-header">
                        <div className="header-left">
                            <h3 className="card-absence-subject">{subject}</h3>
                            {teacher && <span className="teacher-name"> {teacher}</span>}
                        </div>
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
                    {(reason || adminComment) && (
                        <div title={adminComment || reason}>
                            {reason && (
                                <div className="card-absence-reason">
                                    <span className="reason-label">Motif :</span>
                                    <span className="reason-text">{reason_split}</span>
                                </div>
                            )}
                            {comment_split && (
                                <div className="card-absence-reason">
                                    <span className="reason-label">Commentaire :</span>
                                    <span className="reason-text">{comment_split}</span>
                                </div>
                            )}
                            {adminComment && (
                                <div className="card-absence-reason">
                                    <span className="reason-label">Raison du refus :</span>
                                    <span className="reason-text">{adminComment}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="card-absence-right">
                <div className={`mobile-selection-checkbox ${isSelectionMode ? "visible-mobile" : ""}`} onClick={isSelectionMode ? onToggle : undefined}>
                    <div className="selection-checkbox">
                        {isSelected && <span className="icon icon-check" style={{ width: 14, height: 14, backgroundColor: "white" }} />}
                    </div>
                </div>
                <div className={`action-button-wrapper ${isSelectionMode ? "hidden" : ""}`}>
                    {/* {status !== "todo" && <Eye className="icon-eye details-icon" onClick={handleDetails} />} */}
                    {status !== "todo" && (
                        <span
                            className="icon icon-eye details-icon"
                            style={{ backgroundColor: "var(--primary-color)", width: "20px", height: "20px" }}
                            onClick={handleDetails}
                        />
                    )}
                    {status === "todo" && (
                        <button className="btn-justifier" onClick={adminComment ? handleDetails : handleJustify}>
                            {adminComment ? "Modifier" : "Justifier"}
                        </button>
                    )}
                    {status === "pending" && (
                        <button onClick={handleDelete} title="Supprimer" className="remove-justification-button">
                            <img src={trashIcon} alt="Delete" width="20" height="20" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AbsenceCard;
