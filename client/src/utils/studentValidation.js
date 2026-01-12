// Nom des colonnes finales dans la grid
const EXPECTED_HEADERS = ["numero", "loginENT", "nom", "prenom", "promo", "groupeTD", "groupeTP", "promoPair", "groupeTDPair", "groupeTPPair"];

// Regex pour matcher les en-têtes du fichier
const HEADER_MATCH_PATTERNS = {
    // Match : num, numero, numéro, numer, num., num etudiant, num_etudiant, numetudiant,
    // num etu, num_etu, numetu, numéro etudiant, numéro_etudiant, numéro etu, numéro_etu,
    // n. etu, n._etu, n.etu, matricule
    numero: /^(num([eé]ro|er|.)?([\s_-]??[eé]tudiant|[\s_-]??etu)?|n\.[\s_-]??etu?|matricule)$/i,

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

    // Match : 'promo', 'promotion', 'année', 'annee', 'cohorte', 'classe', 'filiere'
    promo: /^(promo(tion)?|anne[eé]?e?|cohorte|classe|filiere)$/i,

    // Match : 'groupe td', 'gpe td', 'gpr td', 'td groupe', 'g.td', 't.d.', 'td', 'travaux dirigé', 'travaux dirigés',
    // 'td-travaux-dirige', 'groupe-travaux-diriges', etc.
    groupeTD: /^(groupe|gp(e|r)|g\.?)?[\s_-]?((t\.?d\.?)|(travaux[\s_-]?dirig[eé]s?))([\s_-]?(groupe|n[o°]?))?$/i,

    // Match : 'groupe tp', 'gpe tp', 'gpr tp', 'tp groupe', 'g.tp', 't.p.', 'tp', 'travaux pratique', 'travaux pratiques',
    // 'tp-travaux-pratique', 'groupe-travaux-pratiques', etc.
    groupeTP: /^(groupe|gp(e|r)|g\.?)?[\s_-]?((t\.?p\.?)|(travaux[\s_-]?pratiqu[eé]s?))([\s_-]?(groupe|n[o°]?))?$/i,

    // Match : 'promo pair', 'promotion pair', 'année paire', 'annee 2', 'promo p2', etc.
    promoPair: /^(promo(tion)?|anne[eé]?e?)[\s_-]?\(?(pair|2|p2|s2)\)?$/i,

    // Match : 'groupe td pair', 'gpe td 2', 'gpr td p2', 'td pair', 'g.td bis', 't.d. supplémentaire',
    // 'travaux dirigé pair', 'travaux-diriges 2', 'groupe-travaux-diriges p2', etc.
    groupeTDPair:
        /^(groupe|gp(e|r)|g\.?)?[\s_-]?((t\.?d\.?)|(travaux[\s_-]?dirig[eé]s?))([\s_-]?(groupe|n[o°]?))?[\s_-]?\(?(pair|2|p2|s2|bis|supplémentaire)\)?$/i,

    // Match : 'groupe tp pair', 'gpe tp 2', 'gpr tp p2', 'tp pair', 'g.tp bis', 't.p. supplémentaire',
    // 'travaux pratique pair', 'travaux-pratiques 2', 'groupe-travaux-pratiques p2', etc.
    groupeTPPair:
        /^(groupe|gp(e|r)|g\.?)?[\s_-]?((t\.?p\.?)|(travaux[\s_-]?pratiqu[eé]s?))([\s_-]?(groupe|n[o°]?))?[\s_-]?\(?(pair|2|p2|s2|bis|supplémentaire)\)?$/i,
};

const DATA_REGEX = {
    numero: /^[0-9]{8}$/,
    loginENT: /^[a-zA-Z0-9._-]{2,20}$/,
    nom: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
    prenom: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
    promo: /^(l[1-3]|m[1-2])$/i,
    groupeTD: /^td[1-9]$/i,
    groupeTP: /^tp[1-9][a-z]?$/i,
    promoPair: /^(l[1-3]|m[1-2])$/i,
    groupeTDPair: /^td[1-9]$/i,
    groupeTPPair: /^tp[1-9][a-z]?$/i,
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

    if (!DATA_REGEX.numero.test(String(row["numero"] || "").trim())) errors["numero"] = true;
    if (!DATA_REGEX.loginENT.test(String(row["loginENT"] || "").trim())) errors["loginENT"] = true;
    if (!DATA_REGEX.nom.test(String(row["nom"] || "").trim())) errors["nom"] = true;
    if (!DATA_REGEX.prenom.test(String(row["prenom"] || "").trim())) errors["prenom"] = true;
    if (!DATA_REGEX.promo.test(String(row["promo"] || "").trim())) errors["promo"] = true;
    if (!DATA_REGEX.groupeTD.test(String(row["groupeTD"] || "").trim())) errors["groupeTD"] = true;
    if (!DATA_REGEX.groupeTP.test(String(row["groupeTP"] || "").trim())) errors["groupeTP"] = true;
    if (!DATA_REGEX.promoPair.test(String(row["promoPair"] || "").trim())) errors["promoPair"] = true;
    if (!DATA_REGEX.groupeTDPair.test(String(row["groupeTDPair"] || "").trim())) errors["groupeTDPair"] = true;
    if (!DATA_REGEX.groupeTPPair.test(String(row["groupeTPPair"] || "").trim())) errors["groupeTPPair"] = true;

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
};

export { validateStudentData, matchHeader, EXPECTED_HEADERS, HEADER_DISPLAY_NAMES, DATA_REGEX };
