import "../../../style/Alert.css";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Checkbox from "../Checkbox";

export function ConfirmAlert({ title, message, onConfirm, onCancel, toInput }) {
    const [isClosing, setIsClosing] = useState(false);
    const [localMotif, setLocalMotif] = useState("");
    const [localChecked, setLocalChecked] = useState(false);
    const triggerClose = (callbackAction) => {
        setIsClosing(true);
        setTimeout(() => {
            callbackAction(localMotif, localChecked);
        }, 300);
    };

    const handleConfirmClick = () => {
        if (toInput && localMotif.trim().length === 0) {
            return;
        }
        triggerClose(onConfirm);
    };

    const handleCancelClick = () => {
        triggerClose(onCancel);
    };

    useEffect(() => {
        console.log(localChecked);
    }, [localChecked]);

    return (
        <div className={`alert-overlay ${isClosing ? "closing" : ""}`}>
            <div className={`container ${isClosing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
                <div className="alert-title-container">
                    <h2 className="alert-title">{title}</h2>
                </div>
                <span className="separator"></span>
                <div className="content" style={toInput ? { minHeight: "auto" } : {}}>
                    <span>{message}</span>
                    {toInput ? <span className="input-label">Veuillez saisir un motif :</span> : <></>}
                </div>

                {toInput && (
                    <>
                        <div className="motif-container">
                            <textarea
                                className={`motif-input`}
                                value={localMotif}
                                onChange={(e) => setLocalMotif(e.target.value)}
                                placeholder="Ex: Raison médicale..."
                                rows={3}
                            />
                        </div>
                        <div className="checkbox-container">
                            <Checkbox checked={localChecked} onChange={() => setLocalChecked(!localChecked)} label={"Autoriser les modifications"} />
                        </div>
                    </>
                )}

                <span className="separator"></span>
                <div className="buttons">
                    <button onClick={handleCancelClick}>Annuler</button>
                    <span className="vertical-separator"></span>
                    <button onClick={handleConfirmClick} disabled={toInput && localMotif.trim().length === 0}>
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
}
