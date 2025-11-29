import React from "react";
import "../../style/Common.css";
function InputField({ placeholder, text }) {
  return (
    <div className="input">
      <text>{text}</text>
      <input placeholder={placeholder}></input>
    </div>
  );
}

export default InputField;
