import { useState } from "react";
import toast from "react-hot-toast";

export const useJustificationValidation = () => {
    const [errors, setErrors] = useState({});
    const [periodError, setPeriodError] = useState(false);
    const [reasonError, setReasonError] = useState(false);

    const periodsOverlap = (p1, p2) => {
        if (!p1.start || !p1.end || !p2.start || !p2.end) return false;
        return p1.start < p2.end && p2.start < p1.end;
    };

    const validatePeriods = (currentPeriods) => {
        const newErrors = {};
        const overlapErrorMsg = "Les périodes se chevauchent";
        const invalidDateErrorMsg = "La date de fin doit être postérieure au début";
        let hasOverlap = false;
        let hasInvalidDate = false;

        for (let i = 0; i < currentPeriods.length; i++) {
            const p1 = currentPeriods[i];

            // Check if start >= end
            if (p1.start >= p1.end) {
                newErrors[p1.id] = invalidDateErrorMsg;
                hasInvalidDate = true;
            }

            // Check for overlaps
            for (let j = i + 1; j < currentPeriods.length; j++) {
                const p2 = currentPeriods[j];
                if (periodsOverlap(p1, p2)) {
                    if (!newErrors[p1.id]) newErrors[p1.id] = overlapErrorMsg;
                    if (!newErrors[p2.id]) newErrors[p2.id] = overlapErrorMsg;
                    hasOverlap = true;
                }
            }
        }

        setErrors(newErrors);
        toast.dismiss();

        if (hasInvalidDate) {
            toast.error(invalidDateErrorMsg);
        } else if (hasOverlap) {
            toast.error(overlapErrorMsg);
        }

        const isValid = Object.keys(newErrors).length === 0;
        setPeriodError(!isValid);

        return isValid;
    };

    const validateReason = (reason, comment) => {
        let isValid = true;
        if (!reason || (reason === "autre" && !comment)) {
            isValid = false;
        }
        setReasonError(!isValid);
        return isValid;
    };

    const validateAll = (periods, reason, comment) => {
        const isPeriodsValid = validatePeriods(periods);
        const isReasonValid = validateReason(reason, comment);

        if (periods.length === 0) {
            toast.error("Veuillez ajouter au moins une période d'absence.");
            setPeriodError(true);
            return false;
        }

        if (!isPeriodsValid) {
            toast.error("Veuillez corriger les erreurs dans les périodes d'absence.");
            return false;
        }

        if (!isReasonValid) {
            const errorMsg = !reason ? "Veuillez indiquer un motif." : "Veuillez ajouter un commentaire pour le motif 'Autre'.";
            toast.error(errorMsg);
            return false;
        }

        return true;
    };

    return {
        errors,
        periodError,
        reasonError,
        setPeriodError, // Needed for simple resets if used outside
        setReasonError, // Needed for simple resets if used outside
        validatePeriods,
        validateReason,
        validateAll,
    };
};
