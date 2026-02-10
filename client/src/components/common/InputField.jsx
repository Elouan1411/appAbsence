import React from "react";

function InputField({
    placeholder,
    text,
    type = "text",
    value,
    onChange,
    disabled = false,
    error = null,
    style = {},
    rightIcon,
    onRightIconClick,
    autocomplete,
    name,
}) {
    return (
        <div className={`input ${error ? "input-error-form" : ""}`} style={style}>
            <div className="label-container" style={{ marginBottom: "8px" }}>
                <p>{text}</p>
            </div>
            <div style={{ position: "relative", width: "100%" }}>
                <input
                    placeholder={placeholder}
                    type={type}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={error ? "border-red" : ""}
                    style={{ paddingRight: "15px" }}
                    autoComplete={autocomplete}
                    name={name}
                />
                {rightIcon && (
                    <div
                        onClick={onRightIconClick}
                        style={{
                            position: "absolute",
                            right: "15px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--primary-color)",
                        }}
                    >
                        {rightIcon}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InputField;
