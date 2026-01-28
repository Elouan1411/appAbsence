import React from "react";
import Button from "../common/Button";
import CustomLoader from "../common/CustomLoader";

function ValidationFooter({ handleConfirmRefuse, handleConfirmValidation, isLoading }) {
    return (
        <footer className="validation-footer">
            <div className="button-container">
                {isLoading ? (
                    <CustomLoader />
                ) : (
                    <>
                        <Button className="action-button refuse-button" onClick={handleConfirmRefuse}>
                            Refuser
                        </Button>
                        <Button className="action-button validate-button" onClick={handleConfirmValidation}>
                            Valider
                        </Button>
                    </>
                )}
            </div>
        </footer>
    );
}

export default ValidationFooter;
