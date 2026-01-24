import React from "react";
import "../../style/Student.css";
import "../../style/StudentMobile.css";
// import { CheckCircle, AlertCircle, Clock, Archive } from "lucide-react";

const AbsenceStatus = ({ status, adminComment }) => {
    const getStatusConfig = () => {
        switch (status) {
            case "todo":
                return {
                    text: adminComment ? "Refusée" : "Action requise",
                    className: "status-badge-refused",
                    containerClass: "status-container-refused",
                    // icon: <AlertCircle size={16} />,
                    icon: <span className="icon icon-alert-circle" style={{ width: 16, height: 16, backgroundColor: "currentColor" }} />,
                    color: "var(--error-color)",
                };
            case "pending":
                return {
                    text: "En attente de validation",
                    className: "status-badge-pending",
                    containerClass: "status-container-pending",
                    // icon: <Clock size={16} />,
                    icon: <span className="icon icon-clock" style={{ width: 16, height: 16, backgroundColor: "currentColor" }} />,
                    color: "var(--warning-color)",
                };
            case "validated":
                return {
                    text: "Justifiée",
                    className: "status-badge-validated",
                    containerClass: "status-container-validated",
                    // icon: <CheckCircle size={16} />,
                    icon: <span className="icon icon-check-circle" style={{ width: 16, height: 16, backgroundColor: "currentColor" }} />,
                    color: "var(--upload-success-color)",
                };
            case "refused":
                return {
                    text: "Refusée",
                    className: "status-badge-refused",
                    containerClass: "status-container-refused",
                    // icon: <AlertCircle size={16} />,
                    icon: <span className="icon icon-alert-circle" style={{ width: 16, height: 16, backgroundColor: "currentColor" }} />,
                    color: "var(--error-color)",
                };
            default:
                return {
                    text: "Archivé",
                    className: "status-badge-archived",
                    containerClass: "status-container-archived",
                    // icon: <Archive size={16} />,
                    icon: <span className="icon icon-archive" style={{ width: 16, height: 16, backgroundColor: "currentColor" }} />,
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
