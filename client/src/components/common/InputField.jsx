import React from "react";
function InputField({
  placeholder,
  text,
  type = "text",
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div className="input">
      <p>{text}</p>
      <input
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
      ></input>
    </div>
  );
}

export default InputField;
