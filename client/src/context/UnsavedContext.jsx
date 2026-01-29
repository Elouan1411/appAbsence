import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

const UnsavedContext = createContext(null);

export const UnsavedProvider = ({ children }) => {
    const [hasUnsavedChanges, setHasUnsavedChangesState] = useState(false);
    const [unsavedTitle, setUnsavedTitle] = useState("");
    const [unsavedMessage, setUnsavedMessage] = useState("");

    const setHasUnsavedChanges = useCallback((value, title = "", message = "") => {
        setHasUnsavedChangesState(value);
        if (value) {
            setUnsavedTitle(title);
            setUnsavedMessage(message);
        } else {
            setUnsavedTitle("");
            setUnsavedMessage("");
        }
    }, []);

    const value = useMemo(
        () => ({
            hasUnsavedChanges,
            setHasUnsavedChanges,
            unsavedTitle,
            unsavedMessage,
        }),
        [hasUnsavedChanges, setHasUnsavedChanges, unsavedTitle, unsavedMessage],
    );

    return <UnsavedContext.Provider value={value}>{children}</UnsavedContext.Provider>;
};

export const useUnsaved = () => useContext(UnsavedContext);
