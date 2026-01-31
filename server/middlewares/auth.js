const jwt = require("jsonwebtoken");

//Middleware de vérification de la validité du token
function verifyToken(req, res, next) {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(403).json({ error: "Token manquant" });
    }
    jwt.verify(token, "app absence", (err, decodedToken) => {
        if (err) {
            res.status(500).json({ error: "Token invalide" });
        }
        req.user = decodedToken;
        next();
    });
}

//Middleware qui vérifie si l'utilisateur est un admin
function isAdmin(req, res, next) {
    if (req.user.pwd.split("-")[1] === "admin") {
        return next();
    }
    res.status(403).json({ error: "Accès refusé" });
}

//Middleware qui vérifie si l'utilisateur est un admin ou un professeur
function isAdminOrTeacher(req, res, next) {
    if (req.user && req.user.pwd) {
        const parts = req.user.pwd.split("-");
        const role = parts[1];
        if (role === "admin" || role === "teacher") {
            return next();
        }
    }
    res.status(403).json({ error: "Accès refusé" });
}

function isTeacher(req, res, next) {
    if (req.user.pwd.split("-")[1] === "admin") {
        return next();
    }
    res.status(403).json({ error: "Accès refusé" });
}

//Fonction qui vérifie si l'utilisateur est un admin ou le propriétaire de l'absence
function isAdminOrOwner(login) {
    return (req, res, next) => {
        const role = req.user.pwd.split("-")[1];
        const userLogin = req.user.pwd.split("-")[0];
        let loginParam = req.params[login];
        const bodyParam = req.body ? req.body[login] : undefined;

        if (loginParam && loginParam.startsWith(":")) {
            loginParam = loginParam.substring(1);
        }

        if (role === "admin" || userLogin === loginParam || userLogin === bodyParam) return next();
        res.status(403).json({ error: "Accès refusé" });
    };
}

function isOwner(login) {
    return (req, res, next) => {
        const userLogin = req.user.pwd.split("-")[0]; // login de l'utilisateur connecté
        const loginParam = req.params[login]; // login présent dans l'URL

        if (userLogin === loginParam) return next();
        res.status(403).json({ error: "Accès refusé" });
    };
}

module.exports = {
    isAdmin,
    isAdminOrOwner,
    isAdminOrTeacher,
    verifyToken,
    isOwner,
    isTeacher,
};
