import React from "react";

export default function Button({ children, onClick, disabled = false }) {
  return (
    <button
      type="button"
      variant="contained"
      className="button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
