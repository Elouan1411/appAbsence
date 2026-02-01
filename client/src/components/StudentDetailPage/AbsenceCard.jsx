import React, { useState } from "react";
import "../../style/Student.css";
import "../../style/StudentMobile.css";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import { useUnsaved } from "../../context/UnsavedContext";
import toast from "react-hot-toast";
import { alertConfirm } from "../../hooks/alertConfirm";

import { API_URL } from "../../config";
import CustomLoader from "../common/CustomLoader";

const AbsenceCard = ({ subject, startTime, endTime, fullPeriod, justified, validite, motifValidite, courseType, nom, prenom, idAbsence, setToUpdate }) => {
    // const navigate = useNavigate();
    // const { hasUnsavedChanges } = useUnsaved();
    // const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    // const handleJustify = () => {
    //     safeNavigate("/dashboard/justification", {
    //         state: { prefilledPeriod: [fullPeriod] },
    //     });
    // };
    const { hasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);
    const [isLoading, setLoading] = useState(false);

    const handleDeleteAbsence = async () => {
        const confirmation = await alertConfirm("Voulez-vous supprimer cette absence ?");
        if (confirmation.isConfirmed) {
            try {
                setLoading(true);
                const result = await fetch(`${API_URL}/absence/` + idAbsence, {
                    method: "DELETE",
                    credentials: "include",
                });
                const data = await result.json();
                toast.success(data);
                setToUpdate(true);
            } catch (err) {
                toast.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const getStatusBadge = () => {
        if (validite === 0) return { text: "Justifiée", className: "justification-badge justified-badge" };
        if (validite === 1) return { text: "Refusée", className: "justification-badge refused-badge" };
        if (validite === 2) return { text: "En cours", className: "justification-badge pending-badge" };
        if (validite === 3) return { text: "Attente modif", className: "justification-badge pending-badge" };
        return { text: "Non justifiée", className: "justification-badge no-justified-badge" };
    };

    const status = getStatusBadge();

    return (
        <div className={`card-absence`}>
            <div className="card-absence-left">
                <div className={`selection-checkbox-wrapper`}>
                    {/* <div className="selection-checkbox">{isSelected && <Check size={14} color="white" strokeWidth={4} />}</div> */}
                    {/* <div className="selection-checkbox">{isSelected && <span className="icon icon-check" style={{ backgroundColor: "white", width: "14px", height: "14px" }} />}</div> */}
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
            <div className="right-buttons-container">
                <div className="justified-container" style={{ width: "auto", flexDirection: "column", alignItems: "flex-end", gap: "5px", marginRight: "10px" }}>
                    <span className={status.className}>
                        {status.text}
                    </span>
                    {(validite === 1 || validite === 3) && motifValidite && (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "right", maxWidth: "150px" }}>
                            {motifValidite}
                        </span>
                    )}
                </div>
                {isLoading ? (
                    <CustomLoader />
                ) : (
                    <button className="delete-button" onClick={() => handleDeleteAbsence()}>
                        <span className="icon icon-trash" />
                    </button>
                )}
                <button className="absence-detail-button">
                    {/* <Eye className="icon-eye details-icon" onClick={() => safeNavigate("/admin/absencedetail/" + idAbsence)} /> */}
                    <span className="icon icon-eye details-icon icon-xl icon-primary" onClick={() => safeNavigate("/admin/absencedetail/" + idAbsence)} />
                </button>
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
