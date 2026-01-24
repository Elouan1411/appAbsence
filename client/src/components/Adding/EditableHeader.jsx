import React, { useState, useEffect } from "react";
// import { Trash2 } from "lucide-react";

const EditableHeader = (props) => {
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

  return (
    <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "5px" }}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="editable-header-input"
      />
      {context && context.onDelete && (
          // <Trash2 
            //   size={16} 
            //   color="red" 
            //   style={{ cursor: "pointer" }} 
            //   onClick={(e) => {
            //       e.stopPropagation();
            //       context.onDelete(props.column.colId);
            //   }}
            // />
            <span 
                className="icon icon-trash" 
                style={{ width: 16, height: 16, backgroundColor: "red", cursor: "pointer" }}
                onClick={(e) => {
                    e.stopPropagation();
                    context.onDelete(props.column.colId);
                }}
            />
      )}
    </div>
  );
};

export default React.memo(EditableHeader);
