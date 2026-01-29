import React, { useState, useEffect } from "react";

const EditableHeader = (props) => {
    const [value, setValue] = useState(props.displayName);
    const context = props.context; // Access to the context passed via Grid (onRename)

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
            <input type="text" value={value} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} className="editable-header-input" />
            {context && context.onDelete && (
                <span
                    className="icon icon-trash icon-medium icon-red"
                    style={{ cursor: "pointer" }}
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
