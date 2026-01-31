import { useNavigate } from "react-router-dom";
import { alertConfirm } from "./alertConfirm";
import { useUnsaved } from "../context/UnsavedContext";

export function useSafeNavigate(hasUnsavedImport) {
    const navigate = useNavigate();
    const { setHasUnsavedChanges, unsavedTitle, unsavedMessage } = useUnsaved();

    const safeNavigate = async (to, options) => {
        if (hasUnsavedImport) {
            const title = unsavedTitle || "Souhaitez-vous vraiment quitter cette page ?";
            const message = unsavedMessage || "Les données importées seront perdues.";
            const result = await alertConfirm(title, message);
            if (!result.isConfirmed) return;
        }
        setHasUnsavedChanges(false);
        navigate(to, options);
    };

    return safeNavigate;
}
