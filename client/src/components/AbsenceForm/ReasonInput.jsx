import React from "react";
import "../../style/Student.css";

const ReasonInput = ({ reason, comment, onReasonChange, onCommentChange }) => {
    return (
        <div className="reason-input">
            <div className="select-container">
                <label htmlFor="reason" className="select-label">
                    Motif de l'absence
                </label>

                <select id="reason" className="custom-select" value={reason} onChange={(e) => onReasonChange(e.target.value)}>
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
                    className="custom-textarea"
                    value={comment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    placeholder="Ajoutez un commentaire ou des détails supplémentaires..."
                />
            </div>
        </div>
    );
};

export default ReasonInput;
