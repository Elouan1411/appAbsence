import React from "react";
import "../../style/Student.css";
import "../../style/StudentMobile.css";
import { motif_translation } from "../../constants/motif_translation";

const ReasonInput = ({ reason, comment, onReasonChange, onCommentChange, error, readOnly }) => {
    if (readOnly) {
        return (
            <div className="reason-readonly-container">
                <div className="reason-readonly-grid">
                    <div className="info-card reason-card">
                        <div className="info-card-header">
                            <span className="icon icon-file-text icon-large info-icon reason-icon" />
                            <span className="info-card-title">Motif de l'absence</span>
                        </div>
                        <div className="info-value-box reason-value-box">{motif_translation[reason] || reason || "Motif non spécifié"}</div>
                    </div>

                    <div className="info-card comment-card">
                        <div className="info-card-header">
                            <span className="icon icon-message-square icon-large info-icon comment-icon" />
                            <span className="info-card-title">Commentaire</span>
                        </div>
                        <div className="info-value-box comment-value-box">{comment || "Aucun commentaire"}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reason-input">
            <div className="select-container-student">
                <label htmlFor="reason" className="section-title-student">
                    Motif de l'absence
                </label>

                <select
                    id="reason"
                    className={`custom-select ${error && !reason ? "input-error" : ""}`}
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    title={error && !reason ? "Veuillez sélectionner un motif" : ""}
                >
                    <option value="" key="" disabled>
                        Sélectionnez un motif...
                    </option>

                    {Object.entries(motif_translation).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <textarea
                    id="comment"
                    className={`custom-textarea ${error && !comment ? "input-error" : ""}`}
                    value={comment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    placeholder="Ajoutez un commentaire ou des détails supplémentaires..."
                    title={error && !comment ? "Veuillez ajouter un commentaire" : ""}
                />
            </div>
        </div>
    );
};

export default ReasonInput;
