// useSafeNavigate.js
import { useNavigate } from "react-router-dom";
import { alertConfirm } from "./alertConfirm";
import { useUnsaved } from "../context/UnsavedContext";

export function useSafeNavigate(hasUnsavedImport) {
    const navigate = useNavigate();
    const { setHasUnsavedChanges } = useUnsaved();

    const safeNavigate = async (to, options) => {
        if (hasUnsavedImport) {
            const result = await alertConfirm("Souhaitez-vous vraiment quitter cette page ?", "Les données importées seront perdues.");
            if (!result.isConfirmed) return;
        }
        setHasUnsavedChanges(false);
        navigate(to, options);
    };

    return safeNavigate;
}
