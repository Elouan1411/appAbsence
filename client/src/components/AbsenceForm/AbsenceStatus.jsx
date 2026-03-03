import React from "react";
import "../../style/Student.css";
import "../../style/StudentMobile.css";

const AbsenceStatus = ({ status, adminComment }) => {
    const getStatusConfig = () => {
        switch (status) {
            case "todo":
                return {
                    text: adminComment ? "Refusée" : "Action requise",
                    className: "status-badge-refused",
                    containerClass: "status-container-refused",
                    icon: <span className="icon icon-alert-circle icon-medium icon-red"  title="Refusée" />,
                    color: "var(--error-color)",
                };
            case "pending":
                return {
                    text: "En attente de validation",
                    className: "status-badge-pending",
                    containerClass: "status-container-pending",
                    icon: <span className="icon icon-clock icon-medium icon-pending"  title="En attente" />,
                    color: "var(--warning-color)",
                };
            case "validated":
                return {
                    text: "Justifiée",
                    className: "status-badge-validated",
                    containerClass: "status-container-validated",
                    icon: <span className="icon icon-check-circle icon-medium icon-success"  title="Valider" />,
                    color: "var(--upload-success-color)",
                };
            case "refused":
                return {
                    text: "Refusée",
                    className: "status-badge-refused",
                    containerClass: "status-container-refused",
                    icon: <span className="icon icon-alert-circle icon-medium icon-red"  title="Refusée" />,
                    color: "var(--error-color)",
                };
            default:
                return {
                    text: "Archivé",
                    className: "status-badge-archived",
                    containerClass: "status-container-archived",
                    icon: <span className="icon icon-archive icon-medium icon-text-secondary"  title="Archive" />,
                    color: "var(--text-secondary)",
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`absence-status-card ${config.containerClass}`}>
            <div className="status-header">
                <span className={`status-badge ${config.className}`}>
                    {config.icon}
                    {config.text}
                </span>
            </div>

            {adminComment && (status === "refused" || status === "todo") && (
                <div className="admin-comment-section">
                    <span className="admin-comment-label">RAISON DU REFUS / COMMENTAIRE ADMINISTRATIF :</span>
                    <div className="admin-comment-box">{adminComment}</div>
                </div>
            )}
        </div>
    );
};

export default AbsenceStatus;
