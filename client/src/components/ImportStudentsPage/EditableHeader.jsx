import React, { useState, useEffect } from "react";

const EditableHeader = (props) => {//TODO: (@everyone) corriger warning console : [Violation] 'requestAnimationFrame' handler took 59ms
  const [value, setValue] = useState(props.displayName);
  const context = props.context; // Accès au contexte passé via Grid (onRename)
  
  useEffect(() => {
    setValue(props.displayName);
  }, [props.displayName]);

  const onChange = (event) => {
    setValue(event.target.value);
  };

  const onBlur = () => {
    if (value !== props.displayName) {
        if (context && context.onRename) {
            context.onRename(props.column.colId, value);
        }
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
        event.target.blur();
    }
  };

  return ( //TODO: (@everyone) ajouter un bouton pour supprimer les colonnes grisées
    <div style={{ width: "100%" }}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="ag-header-cell-text"
        style={{//TODO: (@elouan) améliorer le design => meme police meme taille que le reste
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "2px",
          backgroundColor: "#fff",
          color: "#000",
          fontSize: "12px"
        }}
      />
    </div>
  );
};

export default EditableHeader;
