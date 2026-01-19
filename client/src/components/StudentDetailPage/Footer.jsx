import React from "react";
import Button from "../common/Button";

function Footer({ handleDeleteUser, handleConfirmModification, setEditing, handleCancelChanges, editing }) {
    return (
        <div className="footer-container">
            <Button onClick={editing ? () => handleCancelChanges() : () => handleDeleteUser()} className="delete-student-button">
                <span>{editing ? "Annuler" : "Supprimer"}</span>
            </Button>
            <Button onClick={editing ? () => handleConfirmModification() : () => setEditing(true)} className="save-student-button">
                <span>{editing ? "Sauvegarder" : "Éditer"}</span>
            </Button>
        </div>
    );
}

export default Footer;
