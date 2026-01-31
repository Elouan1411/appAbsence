const express = require("express");
const createToken = require("../utils/auth");
const { verifyToken } = require("../middlewares/auth");
const router = express.Router();
const auth = require("../routes/ldap");
const db = require("../database/db");
const { readEmail } = require("../utils/readEmail");
const maxAge = 10 * 60 * 60 * 1000; // 10 heures
let users = {};
users["etudiant"] = { password: 1234, role: "student" };
users["apierrot"] = { password: 1234, role: "admin" };
users["fdadeau"] = { password: 1234, role: "teacher" };

/**
 * Check if the user has an account
 * @param {*} user
 */
function haveAccount(user) {
    const sql = `SELECT * FROM Eleve WHERE loginENT = ?`;
    return new Promise((resolve, reject) => {
        db.all(sql, [user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.length > 0);
        });
    });
}

/*****************************************
 *            Méthodes GET
 *****************************************/
//Récupération des informations de l'utilisateur en fonction de son token
router.get("/", verifyToken, (req, res) => {
    const [login, role] = req.user.pwd.split("-");

    res.status(200).json({
        user: {
            login,
            role,
        },
    });
});
/*****************************************
 *            Méthodes POST
 *****************************************/

//Route pour se connecter
router.post("/login", async (req, res) => {
    const { user, pwd } = req.body;
    console.log({ user, pwd });

    // CODE DEV
    if (users[user] != undefined) {
        if (users[user].password == pwd) {
            const token = createToken(user + "-" + users[user]["role"]);
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: maxAge,
                sameSite: "strict",
            });
            res.status(200).json(users[user]["role"]);
            return;
        } else {
            res.status(401).json("Mot de passe incorrect");
        }
    } else {
        const authentification = await auth(user, pwd);
        if (!authentification.status) {
            res.status(401).json(authentification.error);
        } else if (!authentification.isInfo) {
            res.status(401).json("Vous n'avez pas accès à cette application (réservé aux membres du département Informatique)");
        } else if (!(await haveAccount(user))) {
            res.status(401).json(`Votre compte n'a pas été ajouté dans le gestionnaire des absences, veuillez envoyer un mail à ${readEmail()}`);
        } else {
            const token = createToken(user + "-" + authentification.role);
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: maxAge,
                sameSite: "strict",
            });
            res.status(200).json(authentification.role);
        }
    }

    // CODE FINAL ...
});

//Route pour se déconnecter
router.post("/logout", (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ succès: "Déconnecté" });
    }
});

//Route pour s'inscrire
// router.post("/register", (req, res) => {
//     // TODO: - Faire la route pour l'inscription
// });

// router.get("/role", verifyToken, (req, res) => {
//   res.status(200).json(de)
// });

module.exports = router;
