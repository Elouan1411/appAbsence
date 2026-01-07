import "../../../style/Alert.css";
import { useState } from "react";
export function ConfirmAlert({ title, message, onConfirm, onCancel }) {
  const [isClosing, setIsClosing] = useState(false);

  const closeAnimation = (callbackAction) => {
    setIsClosing(true);

    setTimeout(() => {
      callbackAction();
    }, 300);
  };
  return (
    <div className={`container ${isClosing ? "closing" : ""}`}>
      <div className="alert-title-container">
        <h2 className="alert-title">{title}</h2>
      </div>
      <span className="separator"></span>
      <div className="content">
        <span>{message}</span>
      </div>
      <span className="separator"></span>
      <div className="buttons">
        <button onClick={() => closeAnimation(onCancel)} className="">
          Annuler
        </button>
        <span className="vertical-separator"></span>
        <button onClick={() => closeAnimation(onConfirm)} className="">
          Confirmer
        </button>
      </div>
    </div>
  );
}
