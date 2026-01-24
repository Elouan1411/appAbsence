const VALID_REASONS = [
    "medical",
    "pb-transport",
    "administratif",
    "convocation",
    "sportif",
    "universitaire",
    "autre",
];

const validateJustificationInput = (body) => {
    const { start, end, justification } = body;

    // validate dates
    if (!start || !end) {
        return { valid: false, message: "Les dates de début et de fin sont requises." };
    }

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    if (isNaN(startTime) || isNaN(endTime)) {
        return { valid: false, message: "Format de date invalide." };
    }

    if (startTime >= endTime) {
        return { valid: false, message: "La date de fin doit être postérieure au début." };
    }

    // validate reason and comment
    if (!justification || typeof justification !== "string") {
        return { valid: false, message: "Le motif est requis." };
    }

    let reason = justification;
    let comment = "";

    // check if it contains the separator " | "
    const separatorIndex = justification.indexOf(" | ");
    if (separatorIndex !== -1) {
        reason = justification.substring(0, separatorIndex);
        comment = justification.substring(separatorIndex + 3);
    }

    if (!VALID_REASONS.includes(reason)) {
        return { valid: false, message: "Motif invalide." };
    }

    // check strict rule for "autre"
    if (reason === "autre") {
        if (!comment || comment.trim() === "") {
            return { valid: false, message: "Un commentaire est obligatoire pour le motif 'Autre'." };
        }
    }

    return { valid: true };
};

module.exports = {
    validateJustificationInput,
};
