// Nom des colonnes finales dans la grid
const EXPECTED_HEADERS = ["Numéro", "Login", "Nom", "Prénom", "Promo", "Groupe TD", "Groupe TP", "Promo Pair", "Groupe TD Pair", "Groupe TP Pair"];

// Regex pour matcher les en-têtes du fichier
const HEADER_MATCH_PATTERNS = {
    // Match : num, numero, numéro, numer, num., num etudiant, num_etudiant, numetudiant,
    // num etu, num_etu, numetu, numéro etudiant, numéro_etudiant, numéro etu, numéro_etu,
    // n. etu, n._etu, n.etu, matricule
    Numéro: /^(num([eé]ro|er|.)?([\s_-]??[eé]tudiant|[\s_-]??etu)?|n\.[\s_-]??etu?|matricule)$/i,

    // Match : login, login ent, login_ent, loginent, id, ident, identifiant,
    // user, username, user_name, pseudo, compte,
    // ainsi que toute chaîne contenant "ent" ou "ldap" entouré d'espaces ou d'underscores
    // (ex : " ent", "_ent", " ent ", "_ent_", etc.)
    Login: /^(login([\s_-]??ent)?|id(entifiant)?|user([\s_-]??name)?|pseudo|compte|.*[\s_-]??ent[\s_-]??.*|.*[\s_-]??ldap[\s_-]??.*)$/i,

    // Match :
    // 'nom', 'nom_de_famille', 'nom de famille', 'lastname', 'familyname', 'family_name', 'name'
    // Ne match jamais une chaîne contenant uniquement 'prénom'
    Nom: /^(nom([\s_-]??de[\s_-]??famille)?|lastname|family[\s_-]??name|name)$/i,

    // Match :
    // 'prénom', 'prenom', 'prénom usuel', 'prenom_usuel', 'first name', 'first_name', 'given name', 'given_name'
    Prénom: /^(pr[eé]nom([\s_-]??usuel)?|first[\s_-]??name|given[\s_-]??name|surname)$/i,

    // Match : 'promo', 'promotion', 'année', 'annee', 'cohorte', 'classe', 'filiere'
    Promo: /^(promo(tion)?|anne[eé]?e?|cohorte|classe|filiere)$/i,

    // Match : 'groupe td', 'gpe td', 'gpr td', 'td groupe', 'g.td', 't.d.', 'td', 'travaux dirigé', 'travaux dirigés',
    // 'td-travaux-dirige', 'groupe-travaux-diriges', etc.
    "Groupe TD": /^(groupe|gp(e|r)|g\.?)?[\s_-]?((t\.?d\.?)|(travaux[\s_-]?dirig[eé]s?))([\s_-]?(groupe|n[o°]?))?$/i,

    // Match : 'groupe tp', 'gpe tp', 'gpr tp', 'tp groupe', 'g.tp', 't.p.', 'tp', 'travaux pratique', 'travaux pratiques',
    // 'tp-travaux-pratique', 'groupe-travaux-pratiques', etc.
    "Groupe TP": /^(groupe|gp(e|r)|g\.?)?[\s_-]?((t\.?p\.?)|(travaux[\s_-]?pratiqu[eé]s?))([\s_-]?(groupe|n[o°]?))?$/i,

    // Match : 'promo pair', 'promotion pair', 'année paire', 'annee 2', 'promo p2', etc.
    "Promo Pair": /^(promo(tion)?|anne[eé]?e?)[\s_-]?(pair|2|p2)$/i,

    // Match : 'groupe td pair', 'gpe td 2', 'gpr td p2', 'td pair', 'g.td bis', 't.d. supplémentaire',
    // 'travaux dirigé pair', 'travaux-diriges 2', 'groupe-travaux-diriges p2', etc.
    "Groupe TD Pair": /^(groupe|gp(e|r)|g\.?)?[\s_-]?((t\.?d\.?)|(travaux[\s_-]?dirig[eé]s?))([\s_-]?(groupe|n[o°]?))?[\s_-]?(pair|2|p2|bis|supplémentaire)?$/i,

    // Match : 'groupe tp pair', 'gpe tp 2', 'gpr tp p2', 'tp pair', 'g.tp bis', 't.p. supplémentaire',
    // 'travaux pratique pair', 'travaux-pratiques 2', 'groupe-travaux-pratiques p2', etc.
    "Groupe TP Pair":
        /^(groupe|gp(e|r)|g\.?)?[\s_-]?((t\.?p\.?)|(travaux[\s_-]?pratiqu[eé]s?))([\s_-]?(groupe|n[o°]?))?[\s_-]?(pair|2|p2|bis|supplémentaire)?$/i,
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
