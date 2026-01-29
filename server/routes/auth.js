const express = require("express");
const createToken = require("../utils/auth");
const { verifyToken } = require("../middlewares/auth");
const router = express.Router();
const auth = require("../routes/ldap");
const maxAge = 10 * 60 * 60 * 1000; // 10 heures
let users = {};
users["etudiant"] = { password: 1234, role: "student" };
users["apierrot"] = { password: 1234, role: "admin" };
users["fdadeau"] = { password: 1234, role: "teacher" };

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

    const authentification = await auth(user, pwd);

    // CODE DEV
    if (users[user] != undefined) {
        console.log(`${users[user].password}==${pwd}`);
        if (users[user].password == pwd) {
            const token = createToken(user + "-" + users[user]["role"]);
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: maxAge,
                sameSite: "strict",
            });
            res.status(200).json(users[user]["role"]);
            console.log("Token de l'utilisateur : ", token);
            return;
        } else {
            res.status(401).json("Mot de passe incorrect");
            return;
        }
    }

    // CODE FINAL
    if (!authentification.isInfo) {
        res.status(401).json("Vous n'avez pas accès à cette application (réservé aux membres du département Informatique)");
    } else if (authentification.status) {
        const token = createToken(user + "-" + authentification.role);
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge,
            sameSite: "strict",
        });
        res.status(200).json(authentification.role);
        console.log("Token de l'utilisateur : ", token);
    } else {
        res.status(401).json("Identifiants ou mot de passe incorrects");
    }
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
