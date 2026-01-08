import React from "react";

function PersonalInfos({ selectedItem }) {
    return (
        <>
            <div className="info-grid">
                <div className="info-item">
                    <span className="label">Numéro étudiant</span>
                    <span className="value">{selectedItem.numeroEtudiant ?? "-"}</span>
                </div>
                <div className="info-item">
                    <span className="label">Nom</span>
                    <span className="value">{selectedItem.nom ?? "-"}</span>
                </div>
                <div className="info-item">
                    <span className="label">Prénom</span>
                    <span className="value">{selectedItem.prenom ?? "-"}</span>
                </div>
            </div>
            <div className="motif-box">
                <span className="label">Motif déclaré</span>
                <p className="motif-text">
                    <b>{selectedItem.motif ?? "Aucun motif précisé."}</b>
                    {selectedItem.commentaire ? ` : ${selectedItem.commentaire}` : ""}
                </p>
            </div>
        </>
    );
}

export default PersonalInfos;
