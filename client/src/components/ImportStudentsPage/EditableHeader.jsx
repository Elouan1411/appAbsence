import React, { useState, useEffect } from "react";

const EditableHeader = (props) => {
  const [value, setValue] = useState(props.displayName);
  const context = props.context; // Accès au contexte passé via Grid (onRename)
  
  // Met à jour la valeur si le props change (re-render)
  useEffect(() => {
    setValue(props.displayName);
  }, [props.displayName]);

  const onChange = (event) => {
    setValue(event.target.value);
  };

  const onBlur = () => {
    if (context && context.onRename) {
      context.onRename(props.column.colId, value);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
        onBlur();
    }
  };

  return ( 
    <div style={{ width: "100%" }}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="ag-header-cell-text"
        style={{//TODO: faire ca plus beau
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
