import React, { use } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../style/Student.css";
import "../../style/StudentMobile.css";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import { useUnsaved } from "../../context/UnsavedContext";
import toast from "react-hot-toast";
import { alertConfirm } from "../../hooks/alertConfirm";

const AbsenceCard = ({ subject, startTime, endTime, fullPeriod, justified, courseType, nom, prenom, idAbsence, setToUpdate }) => {
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

    const handleDeleteAbsence = async () => {
        console.log(idAbsence);
        const confirmation = await alertConfirm("Voulez-vous supprimer cette absence ?");
        if (confirmation.isConfirmed) {
            try {
                const result = await fetch("http://localhost:3000/absence/" + idAbsence, {
                    method: "DELETE",
                    credentials: "include",
                });
                const data = await result.json();
                toast.success(data);
                setToUpdate(true);
            } catch (err) {
                toast.error(err);
            }
        }
    };

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
            <div className="right-buttons-container">
                <span className={justified ? "justification-badge justified-badge" : "justification-badge no-justified-badge"}>
                    {justified ? "Justifiée" : "Non justifiée"}
                </span>
                <button className="delete-button" onClick={() => handleDeleteAbsence()}>
                    <span className="icon icon-trash" />
                </button>
                <button className="absence-detail-button">
                    <span className="icon icon-triple-dot" onClick={() => safeNavigate("/admin/absencedetail/" + idAbsence)} />
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
