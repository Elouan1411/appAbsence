import React from "react";

function InputField({ placeholder, text, type = "text", value, onChange, disabled = false, error = null }) {
    return (
        <div className={`input ${error ? "input-error-form" : ""}`}>
            <div className="label-container">
                <p>{text}</p>
            </div>
            <input placeholder={placeholder} type={type} value={value} onChange={onChange} disabled={disabled} className={error ? "border-red" : ""} />
        </div>
    );
}

export default InputField;
