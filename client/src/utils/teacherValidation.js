// Nom des colonnes finales dans la grid
const EXPECTED_HEADERS = ["loginENT", "nom", "prenom"];

// Regex pour matcher les en-têtes du fichier
const HEADER_MATCH_PATTERNS = {
    // Match : login, login ent, login_ent, loginent, id, ident, identifiant,
    // user, username, user_name, pseudo, compte,
    // ainsi que toute chaîne contenant "ent" ou "ldap" entouré d'espaces ou d'underscores
    // (ex : " ent", "_ent", " ent ", "_ent_", etc.)
    loginENT: /^(login([\s_-]??ent)?|id(entifiant)?|user([\s_-]??name)?|pseudo|compte|.*[\s_-]??ent[\s_-]??.*|.*[\s_-]??ldap[\s_-]??.*)$/i,

    // Match :
    // 'nom', 'nom_de_famille', 'nom de famille', 'lastname', 'familyname', 'family_name', 'name'
    // Ne match jamais une chaîne contenant uniquement 'prénom'
    nom: /^(nom([\s_-]??de[\s_-]??famille)?|lastname|family[\s_-]??name|name)$/i,

    // Match :
    // 'prénom', 'prenom', 'prénom usuel', 'prenom_usuel', 'first name', 'first_name', 'given name', 'given_name'
    prenom: /^(pr[eé]nom([\s_-]??usuel)?|first[\s_-]??name|given[\s_-]??name|surname)$/i,
};

const DATA_REGEX = {
    loginENT: /^[a-zA-Z0-9._-]{2,20}$/,
    nom: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
    prenom: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
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

async function calculateDuplicateRow(row) {
    const warnings = {};

    const data = await fetch("http://localhost:3000/teacher/allLoginENT", {
        method: "GET",
        credentials: "include",
    });
    const logins = await data.json();

    const estPresent = logins.some((item) => item.loginENT === row.loginENT);
    return estPresent;
}

function validateTeacherData(row) {
    const errors = {};

    if (!DATA_REGEX.loginENT.test(String(row["loginENT"] || "").trim())) errors["loginENT"] = true;
    if (!DATA_REGEX.nom.test(String(row["nom"] || "").trim())) errors["nom"] = true;
    if (!DATA_REGEX.prenom.test(String(row["prenom"] || "").trim())) errors["prenom"] = true;

    return errors;
}

const HEADER_DISPLAY_NAMES = {
    numero: "Numéro",
    loginENT: "Login ENT",
    nom: "Nom",
    prenom: "Prénom",
    promo: "Promo",
    groupeTD: "Groupe TD",
    groupeTP: "Groupe TP",
    promoPair: "Promo (Pair)",
    groupeTDPair: "Groupe TD (Pair)",
    groupeTPPair: "Groupe TP (Pair)",
    numeroEtudiant: "Numéro Étudiant",
    debut: "Date début",
    fin: "Date fin",
    motif: "Motif absence",
    commentaire: "Commentaire",
    administrateur: "Rôle",
};

export { calculateDuplicateRow, validateTeacherData, matchHeader, EXPECTED_HEADERS, HEADER_DISPLAY_NAMES };
