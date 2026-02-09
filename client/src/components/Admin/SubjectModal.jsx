import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import InputField from "../common/InputField";
import "../../style/FormModal.css";
import Button from "../common/Button";
import "../../style/icon.css";
import CustomLoader from "../common/CustomLoader";

const SubjectModal = ({ isOpen, onClose, onSubmit, initialData = null, defaultValues = null, promotions = ["L2", "L3", "M1", "M2"], isLoading }) => {
    const [formData, setFormData] = useState({
        libelle: "",
        promo: "",
        spair: "",
        semester: ""
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    libelle: initialData.libelle,
                    promo: initialData.promo,
                    semester: initialData.spair === 1 ? "Pair" : "Impair"
                });
            } else if (defaultValues) {
                setFormData({
                    libelle: "",
                    promo: defaultValues.promo || "",
                    semester: defaultValues.semester || ""
                });
            } else {
                setFormData({
                    libelle: "",
                    promo: "",
                    semester: ""
                });
            }
        }
    }, [isOpen, initialData, defaultValues]);

    if (!isOpen) return null;

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!formData.libelle) {
            toast.error("Le libellé de la matière est requis");
            return false;
        }
        if (!formData.promo) {
            toast.error("La promotion est requise");
            return false;
        }
        if (!formData.semester) {
            toast.error("Le semestre est requis");
            return false;
        }
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = {
            libelle: formData.libelle,
            promo: formData.promo,
            semester: formData.semester
        };
        onSubmit(payload);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content auto-height" style={{width: "60vh"}} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header" style={{marginBottom: "0"}}>
                    <h2>{initialData ? "Modifier une matière" : "Ajouter une matière"}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="icon-x" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="row">
                            <InputField
                                text="Libellé de la matière"
                                placeholder="Analyse syntaxique, Système..."
                                value={formData.libelle}
                                onChange={(e) => handleFieldChange("libelle", e.target.value)}
                                style={{marginBottom: "1rem"}}
                            />
                            <div className="form-group" style={{flex: 1}}>
                                <div className="label-container"><label>Promotion</label></div>
                                <select 
                                    value={formData.promo}
                                    onChange={(e) => handleFieldChange("promo", e.target.value)}
                                >
                                    <option value="">-- Sélectionner une promotion --</option>
                                    {promotions.map(promo => (
                                        <option key={promo} value={promo}>{promo}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group" style={{flex: 1}}>
                                <div className="label-container"><label>Semestre</label></div>
                                <select 
                                    value={formData.semester}
                                    onChange={(e) => handleFieldChange("semester", e.target.value)}
                                >
                                    <option value="">-- Sélectionner le semestre --</option>
                                    <option value="Impair">Impair</option>
                                    <option value="Pair">Pair</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="footer-buttons">
                            <Button type="button" className="btn-cancel validate-btn" onClick={onClose}>
                                Annuler
                            </Button>
                            <Button type="submit" className="btn-submit validate-btn" disabled={isLoading}>
                                {isLoading ? <CustomLoader /> : (initialData ? "Modifier" : "Ajouter")}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubjectModal;
