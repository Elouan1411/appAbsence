import React from "react";
import CustomLoader from "../common/CustomLoader";
import InputField from "../common/InputField";
import { alertConfirm } from "../../hooks/alertConfirm";

function PersonalInformations({ student, loading, editing, onChange }) {
    if (loading) return <CustomLoader />;

    const renderInput = (label, field) => (
        <div className="info-item">
            <span className="label">{label}</span>
            <InputField value={student[field]} disabled={!editing} onChange={(e) => onChange(field, e.target.value)} />
        </div>
    );

    return (
        <div className="personal-info-container">
            <h2>Informations générales</h2>

            <div className="personal-info-subcontainer">
                <div className="info-grid-container">
                    <h3>Informations personnelles</h3>
                    <div className="info-grid">
                        {renderInput("Numéro étudiant", "numeroEtudiant")}
                        {renderInput("Nom", "nom")}
                        {renderInput("Prénom", "prenom")}
                        {renderInput("Identifiant ENT", "loginENT")}
                    </div>
                </div>

                <div className="info-grid-container">
                    <h3>Semestre Impair</h3>
                    <div className="info-grid">
                        {renderInput("Promo", "promo")}
                        {renderInput("Groupe TD", "groupeTD")}
                        {renderInput("Groupe TP", "groupeTP")}
                    </div>
                </div>

                <div className="info-grid-container">
                    <h3>Semestre Pair</h3>
                    <div className="info-grid">
                        {renderInput("Promo", "promoPair")}
                        {renderInput("Groupe TD", "groupeTDPair")}
                        {renderInput("Groupe TP", "groupeTPPair")}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PersonalInformations;
