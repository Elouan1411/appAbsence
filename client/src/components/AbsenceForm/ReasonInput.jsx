import React from "react";
import "../../style/Student.css";

const ReasonInput = ({ reason, comment, onReasonChange, onCommentChange, error }) => {
    return (
        <div className="reason-input">
            <div className="select-container">
                <label htmlFor="reason" className="select-label">
                    Motif de l'absence
                </label>

                <select
                    id="reason"
                    className={`custom-select ${error && !reason ? "input-error" : ""}`}
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    title={error && !reason ? "Veuillez sélectionner un motif" : ""}
                >
                    <option value="" disabled>
                        Sélectionnez un motif...
                    </option>

                    <option value="maladie">Maladie / Raison médicale</option>
                    <option value="rdv-administratif">Rendez-vous administratif</option>
                    <option value="pb-transport">Problème de transport</option>
                    <option value="autre">Autre (préciser ci-dessous)</option>
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
