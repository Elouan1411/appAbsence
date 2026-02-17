import React, { useEffect, useState } from "react";
import CustomLoader from "../common/CustomLoader";
import InputField from "../common/InputField";
import { alertConfirm } from "../../hooks/alertConfirm";
import toast from "react-hot-toast";
import { API_URL } from "../../config";

function PersonalInformations({ student, loading, editing, onChange, setStudent, errors }) {
    const [allRSE, setAllRSE] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const fetchAllRSE = async () => {
        try {
            setLoading(true);
            const result = await fetch(`${API_URL}/rse`, {
                method: "GET",
                credentials: "include",
            });
            const data = await result.json();
            setAllRSE(data);
        } catch (err) {
            toast.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAllRSE();
    }, [editing]);

    if (loading) return <CustomLoader />;

    const renderInput = (label, field) => (
        <div className="info-item">
            <span className="label">{label}</span>
            <InputField value={student[field]} disabled={!editing} onChange={(e) => onChange(field, e.target.value)} error={errors[field]} />
        </div>
    );

    const handleRseChange = (rseOption) => {
        if (editing) {
            setStudent((prev) => {
                const currentRseList = prev.rse;
                const isAlreadySelected = currentRseList.some((item) => item.code === rseOption.code);

                if (isAlreadySelected) {
                    return {
                        ...prev,
                        rse: currentRseList.filter((item) => item.code !== rseOption.code),
                    };
                } else {
                    return {
                        ...prev,
                        rse: [...currentRseList, rseOption],
                    };
                }
            });
        }
    };

    return (
        <div className="personal-info-container">
            <div className="subtitle-container">
                <h2>Informations générales</h2>
            </div>

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

                <div className="rse-section">
                    <p>RSE (Sélection multiple)</p>
                    {isLoading ? (
                        <CustomLoader />
                    ) : (
                        <div className="chips-container">
                            {allRSE.map((option) => {
                                const isSelected = student.rse.some((item) => item.code === option.code);
                                return (
                                    <div key={option.code} className={`rse-chip ${isSelected ? "selected" : ""}`} onClick={() => handleRseChange(option)}>
                                        <span>{option.libelle}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PersonalInformations;
