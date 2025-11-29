import React, { forwardRef } from "react";

const InputField = forwardRef(
  ({ id, label, type = "text", value, onChange, placeholder, icon }, ref) => (
    <div className="input-group">
      <label htmlFor={id}>
        {icon && <span className="input-icon">{icon}</span>}
        <span>{label}</span>
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        autoComplete={type === "text" ? "off" : undefined}
        ref={ref} // ⚠ attach le ref ici
      />
    </div>
  )
);

export default InputField;
