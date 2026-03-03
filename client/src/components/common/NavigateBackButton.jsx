import React from "react";
import { useUnsaved } from "../../context/UnsavedContext";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import "../../style/NavigateBackButton.css";

function NavigateBackButton() {
    const { hasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);
    const handleGoBack = () => {
        safeNavigate(-1);
    };
    return (
        <div id="navigate-button-container">
            <button onClick={handleGoBack}>
                <span className="icon icon-previous" title="Précédent" ></span>
            </button>
        </div>
    );
}

export default NavigateBackButton;
