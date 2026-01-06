import React from "react";

export default function Button({
  children,
  onClick,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="button"
      variant="contained"
      className={`button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
