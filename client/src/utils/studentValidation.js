// ordre important pour l'instant
const EXPECTED_HEADERS = ["Numéro", "Login", "Nom", "Prénom", "Promo", "Groupe TD", "Groupe TP", "Promo Pair", "Groupe TD Pair", "Groupe TP Pair"];

// Regex de validation (pas encore fait vraiment)
const REGEX = {
    header: /^(Numéro|Login|Nom|Prénom|Promo|Groupe TD|Groupe TP|Promo Pair|Groupe TD Pair|Groupe TP Pair)$/i,
    numero: /^[0-9]{8}$/,
    login: /^[a-zA-Z0-9._-]{3,20}$/,
    nom: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
    prenom: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
    groupeTD: /^[0-9A-Z]{1,5}$/,
    groupeTP: /^[0-9A-Z]{1,5}$/,
};

/**
 * Valide une ligne de données étudiante
 * Retourne un objet map des erreurs (ex: { "Numéro": true }) si invalide.
 */
function validateStudentData(row) {
    const errors = {};

    // On utilise les clés définies dans EXPECTED_HEADERS
    if (!REGEX.numero.test(String(row["Numéro"] || "").trim())) errors["Numéro"] = true;

    // Logique rétablie pour tous les champs
    if (!REGEX.login.test(String(row["Login"] || "").trim())) errors["Login"] = true;
    if (!REGEX.nom.test(String(row["Nom"] || "").trim())) errors["Nom"] = true;
    if (!REGEX.prenom.test(String(row["Prénom"] || "").trim())) errors["Prénom"] = true;

    // TD et TP
    if (!REGEX.groupeTD.test(String(row["Groupe TD"] || "").trim())) errors["Groupe TD"] = true;
    if (!REGEX.groupeTP.test(String(row["Groupe TP"] || "").trim())) errors["Groupe TP"] = true;
    console.log(errors);
    return errors;
}

export { validateHeaders, validateStudentData, EXPECTED_HEADERS };
