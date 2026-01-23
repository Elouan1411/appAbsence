import React from "react";
import "../../style/Student.css";
import { FileText, MessageSquare } from "lucide-react";

const REASON_LABELS = {
    maladie: "Maladie / Raison médicale",
    "rdv-administratif": "Rendez-vous administratif",
    "pb-transport": "Problème de transport",
    autre: "Autre",
};

const ReasonInput = ({ reason, comment, onReasonChange, onCommentChange, error, readOnly }) => {
    if (readOnly) {
        return (
            <div className="reason-readonly-container">
                <div className="reason-readonly-grid">
                    {/* Motif Card */}
                    <div className="info-card reason-card">
                        <div className="info-card-header">
                            <FileText size={18} className="info-icon reason-icon" />
                            <span className="info-card-title">Motif de l'absence</span>
                        </div>
                        <div className="info-value-box reason-value-box">{REASON_LABELS[reason] || reason || "Motif non spécifié"}</div>
                    </div>

                    {/* Commentaire Card */}
                    <div className="info-card comment-card">
                        <div className="info-card-header">
                            <MessageSquare size={18} className="info-icon comment-icon" />
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
