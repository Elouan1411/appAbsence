import { createContext, useContext, useState } from "react";

const UnsavedContext = createContext();

export const UnsavedProvider = ({ children }) => {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    return <UnsavedContext.Provider value={{ hasUnsavedChanges, setHasUnsavedChanges }}>{children}</UnsavedContext.Provider>;
};

export const useUnsaved = () => useContext(UnsavedContext);
