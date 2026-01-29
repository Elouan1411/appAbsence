import React, { useState, useEffect } from "react";
import InputField from "../common/InputField";
import "../../style/FormModal.css";
import Button from "../common/Button";
import "../../style/icon.css";
import { API_URL } from "../../config";

import { DATA_REGEX } from "../../utils/studentValidation";
import CustomLoader from "../common/CustomLoader";

const FormModal = ({ isOpen, onClose, mode, onSubmit, isLoading }) => {
    const [RSE, setRSE] = useState([]);
    const [loading, setLoading] = useState(false);
    const initialState = {
        nom: "",
        prenom: "",
        numeroEtudiant: "",
        groupeTD: "",
        groupeTP: "",
        promo: "",
        rse: [],
        loginENT: "",
    };
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setErrors({});
    }, [isOpen]);

    const handleFetchRSE = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/rse/`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) throw new Error("Erreur HTTP " + response.status);

            const result = await response.json();
            console.log(result);
            setRSE(result);
        } catch (err) {
            console.error("Erreur de fetch: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
            handleFetchRSE();
        }
    }, [isOpen, mode]);

    if (!isOpen) return null;

    const handleFieldChange = (field, e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!DATA_REGEX.nom.test(formData.nom)) {
            newErrors.nom = "Format invalide (2-50 caractères)";
        }
        if (!DATA_REGEX.prenom.test(formData.prenom)) {
            newErrors.prenom = "Format invalide (2-50 caractères)";
        }
        if (!DATA_REGEX.loginENT.test(formData.loginENT)) {
            newErrors.loginENT = "Format invalide (ex: jdoe)";
        }

        if (mode === "student") {
            if (!DATA_REGEX.numero.test(formData.numeroEtudiant)) {
                newErrors.numeroEtudiant = "8 chiffres requis";
            }
            if (!DATA_REGEX.promo.test(formData.promo)) {
                newErrors.promo = "Format L1-L3 ou M1-M2";
            }
            if (!DATA_REGEX.groupeTD.test(formData.groupeTD)) {
                newErrors.groupeTD = "Ex: TD1";
            }
            if (!DATA_REGEX.groupeTP.test(formData.groupeTP)) {
                newErrors.groupeTP = "Ex: TP1a";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRseChange = (rseOption) => {
        setFormData((prev) => {
            const currentRseList = prev.rse;

            // check if the element is already present comparing with CODES
            const isAlreadySelected = currentRseList.some((item) => item.code === rseOption.code);

            if (isAlreadySelected) {
                // if present, remove it
                return {
                    ...prev,
                    rse: currentRseList.filter((item) => item.code !== rseOption.code),
                };
            } else {
                // else, add it
                return {
                    ...prev,
                    rse: [...currentRseList, rseOption],
                };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        const cleanData = {};

        cleanData.nom = formData.nom;
        cleanData.prenom = formData.prenom;
        cleanData.loginENT = formData.loginENT;

        if (mode === "student") {
            cleanData.numeroEtudiant = formData.numeroEtudiant;
            cleanData.groupeTD = formData.groupeTD;
            cleanData.groupeTP = formData.groupeTP;
            cleanData.promo = formData.promo;
            cleanData.rse = formData.rse;
        }

        onSubmit(cleanData);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{mode === "student" ? "Ajouter un Étudiant" : "Ajouter un Enseignant"}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="icon-x" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="row">
                            <InputField
                                text="Nom"
                                placeholder="Nom de famille"
                                value={formData.nom}
                                onChange={(e) => handleFieldChange("nom", e)}
                                error={errors.nom}
                            />
                            <InputField
                                text="Prénom"
                                placeholder="Prénom"
                                value={formData.prenom}
                                onChange={(e) => handleFieldChange("prenom", e)}
                                error={errors.prenom}
                            />
                            <InputField
                                text="Login ENT"
                                placeholder="Ex: jdoe"
                                value={formData.loginENT}
                                onChange={(e) => handleFieldChange("loginENT", e)}
                                error={errors.loginENT}
                            />
                        </div>

                        {mode === "student" && (
                            <>
                                <InputField
                                    text="Numéro Étudiant"
                                    placeholder="Ex: 21004567"
                                    value={formData.numeroEtudiant}
                                    onChange={(e) => handleFieldChange("numeroEtudiant", e)}
                                    error={errors.numeroEtudiant}
                                />
                                <InputField
                                    text="Promo"
                                    placeholder="Ex: L1"
                                    value={formData.promo}
                                    onChange={(e) => handleFieldChange("promo", e)}
                                    error={errors.promo}
                                />

                                <div className="row">
                                    <InputField
                                        text="Groupe TD"
                                        placeholder="Ex: TD1"
                                        value={formData.groupeTD}
                                        onChange={(e) => handleFieldChange("groupeTD", e)}
                                        error={errors.groupeTD}
                                    />
                                    <InputField
                                        text="Groupe TP"
                                        placeholder="Ex: TP1A"
                                        value={formData.groupeTP}
                                        onChange={(e) => handleFieldChange("groupeTP", e)}
                                        error={errors.groupeTP}
                                    />
                                </div>

                                <div className="rse-section">
                                    <p>RSE (Sélection multiple)</p>
                                    {loading ? (
                                        <CustomLoader />
                                    ) : (
                                        <div className="chips-container">
                                            {RSE.map((option) => {
                                                const isSelected = formData.rse.some((item) => item.code === option.code);
                                                return (
                                                    <div
                                                        key={option.code}
                                                        className={`rse-chip ${isSelected ? "selected" : ""}`}
                                                        onClick={() => handleRseChange(option)}
                                                    >
                                                        <span>{option.libelle}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <div className="footer-buttons">
                            <Button type="button" className="btn-cancel" onClick={onClose}>
                                Annuler
                            </Button>
                            <Button type="submit" className="btn-submit" disabled={isLoading}>
                                {isLoading ? <CustomLoader /> : "Valider"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormModal;
