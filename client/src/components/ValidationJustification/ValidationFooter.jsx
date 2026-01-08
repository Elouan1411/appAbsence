import React from "react";
import Button from "../common/Button";

function ValidationFooter({ handleConfirmRefuse, handleConfirmValidation }) {
    return (
        <footer className="validation-footer">
            <div className="button-container">
                <Button className="action-button refuse-button" onClick={handleConfirmRefuse}>
                    Refuser
                </Button>
                <Button className="action-button validate-button" onClick={handleConfirmValidation}>
                    Valider
                </Button>
            </div>
        </footer>
    );
}

export default ValidationFooter;
