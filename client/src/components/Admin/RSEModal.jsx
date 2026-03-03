import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import InputField from "../common/InputField";
import "../../style/FormModal.css";
import Button from "../common/Button";
import "../../style/icon.css";
import CustomLoader from "../common/CustomLoader";
import notify from "../../functions/notify";

const RSEModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading }) => {
    const [libelle, setLibelle] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setLibelle(initialData.libelle);
            } else {
                setLibelle("");
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!libelle.trim()) {
            notify("Le libellé du RSE est requis", "error");
            return;
        }
        onSubmit({ libelle });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content auto-height" style={{ width: "60vh" }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header" style={{ marginBottom: "0" }}>
                    <h2>{initialData ? "Modifier un RSE" : "Ajouter un RSE"}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="icon-x"  title="Fermer" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="row">
                            <InputField
                                text="Libellé du RSE"
                                placeholder="Sport de haut niveau, ..."
                                value={libelle}
                                onChange={(e) => setLibelle(e.target.value)}
                                style={{ marginBottom: "1rem" }}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="footer-buttons">
                            <Button type="button" className="btn-cancel validate-btn" onClick={onClose}>
                                Annuler
                            </Button>
                            <Button type="submit" className="btn-submit validate-btn" disabled={isLoading}>
                                {isLoading ? <CustomLoader /> : initialData ? "Modifier" : "Ajouter"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RSEModal;
