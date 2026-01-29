import React, { createContext, useContext, useState } from "react";

const UnsavedContext = createContext(null);

export const UnsavedProvider = ({ children }) => {
    const [hasUnsavedChanges, setHasUnsavedChangesState] = useState(false);
    const [unsavedTitle, setUnsavedTitle] = useState("");
    const [unsavedMessage, setUnsavedMessage] = useState("");

    const setHasUnsavedChanges = (value, title = "", message = "") => {
        setHasUnsavedChangesState(value);
        if (value) {
            setUnsavedTitle(title);
            setUnsavedMessage(message);
        } else {
            setUnsavedTitle("");
            setUnsavedMessage("");
        }
    };

    return <UnsavedContext.Provider value={{ hasUnsavedChanges, setHasUnsavedChanges, unsavedTitle, unsavedMessage }}>{children}</UnsavedContext.Provider>;
};

export const useUnsaved = () => useContext(UnsavedContext);
