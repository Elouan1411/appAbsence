// Ordre important pour l'affichage dans la Grid
const EXPECTED_HEADERS = ["Numéro", "Login", "Nom", "Prénom", "Promo", "Groupe TD", "Groupe TP", "Promo Pair", "Groupe TD Pair", "Groupe TP Pair"];

// Regex pour matcher les en-têtes du fichier (flexible)
const HEADER_MATCH_PATTERNS = {
    Numéro: /^num(ero|éro|\.|_?etudiant)?$/i,
    Login: /^(login( ENT)?|identifiant|user(name)?|pseudo)$/i,
    Nom: /^(nom|lastname|familyname)$/i,
    Prénom: /^pr(e|é)nom|firstname$/i,
    Promo: /^promo(tion)?$/i,
    "Groupe TD": /^(groupe[ _]?)?td$/i,
    "Groupe TP": /^(groupe[ _]?)?tp$/i,
    "Promo Pair": /^promo(tion)?[ _]?pair$/i,
    "Groupe TD Pair": /^(groupe[ _]?)?td[ _]?pair$/i,
    "Groupe TP Pair": /^(groupe[ _]?)?tp[ _]?pair$/i,
};

// TODO: Affiner les regex selon les besoins réels
const DATA_REGEX = {
    numero: /^[0-9]{8}$/,
    login: /^[a-zA-Z0-9._-]{3,20}$/,
    nom: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
    prenom: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
    groupeTD: /^[0-9A-Z]{1,5}$/,
    groupeTP: /^[0-9A-Z]{1,5}$/,
};

/**
 * Tente de faire correspondre un en-tête de fichier avec un en-tête attendu via Regex.
 * @param {string} cellHeader - L'en-tête trouvé dans le fichier.
 * @returns {string|null} - La clé canonique (ex: "Numéro") ou null.
 */
function matchHeader(cellHeader) {
    if (!cellHeader) return null;
    const cellHeaderClean = cellHeader.trim();

    // On teste chaque pattern
    for (const [keyHeader, regex] of Object.entries(HEADER_MATCH_PATTERNS)) {
        if (regex.test(cellHeaderClean)) {
            // dés que ca match, on retourne la clé
            return keyHeader;
        }
    }
    return null;
}

function validateStudentData(row) {
    const errors = {};

    if (!DATA_REGEX.numero.test(String(row["Numéro"] || "").trim())) errors["Numéro"] = true;
    if (!DATA_REGEX.groupeTD.test(String(row["Groupe TD"] || "").trim())) errors["Groupe TD"] = true;
    if (!DATA_REGEX.groupeTP.test(String(row["Groupe TP"] || "").trim())) errors["Groupe TP"] = true;
    //TODO: faire toutes les autres validations

    return errors;
}

export { validateStudentData, matchHeader, EXPECTED_HEADERS };
