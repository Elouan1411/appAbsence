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
users["prof"] = { password: 1234, role: "teacher" };

/**
 * Check if the user has an account
 * @param {*} user
 */
async function haveAccount(user) {
    let sql = `SELECT * FROM Eleve WHERE loginENT = ?`;
    const student = new Promise((resolve, reject) => {
        db.all(sql, [user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.length > 0);
        });
    });

    sql = `SELECT * FROM Professeur WHERE loginENT = ?`;
    const teacher = new Promise((resolve, reject) => {
        db.all(sql, [user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.length > 0);
        });
    });
    return (await student) || (await teacher);
}

/**
 * Check if there is admin in db
 */
async function haveAdmin() {
    const sql = `SELECT * FROM Professeur WHERE administrateur = 1`;
    const admin = new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.length > 0);
        });
    });
    return await admin;
}

/**
 * Get the role of the user
 * and return it
 */
async function getRole(user) {
    let sql = `SELECT * FROM Eleve WHERE loginENT = ?`;
    const student = new Promise((resolve, reject) => {
        db.all(sql, [user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.length > 0);
        });
    });

    sql = `SELECT * FROM Professeur WHERE loginENT = ?`;
    const teacher = new Promise((resolve, reject) => {
        db.all(sql, [user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.length > 0);
        });
    });

    // admin if administrator = 1
    sql = `SELECT * FROM Professeur WHERE loginENT = ? AND administrateur = 1`;
    const admin = new Promise((resolve, reject) => {
        db.all(sql, [user], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.length > 0);
        });
    });
    return (await admin) ? "admin" : (await teacher) ? "teacher" : (await student) ? "student" : "unknown";
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
    // console.log({ user, pwd });

    // CODE DEV
    if (users[user] != undefined) {
        if (!(await haveAccount(user))) {
            res.status(401).json(`Votre compte n'a pas été ajouté dans le gestionnaire des absences, veuillez envoyer un mail à ${readEmail()}`);
        } else if (users[user].password == pwd) {
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
        // CODE FINAL
        if (user === "admin" && pwd === "admin") {
            // default connection for admin the first time
            if (await haveAdmin()) {
                return res.status(401).json("Identifiants ou mot de passe incorrects");
            }
            const token = createToken(user + "-init"); // role -> init (just for create first admin)
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: maxAge,
                sameSite: "strict",
            });
            return res.status(200).json("init");
        }

        const authentification = await auth(user, pwd);
        if (!authentification.status) {
            res.status(401).json(authentification.error);
        } else if (!(await haveAccount(user))) {
            res.status(401).json(`Votre compte n'a pas été ajouté dans le gestionnaire des absences, veuillez envoyer un mail à ${readEmail()}`);
        } else {
            const role = await getRole(user);
            if (role == "unknown") {
                return res.status(401).json("Identifiants ou mot de passe incorrects");
            }
            const token = createToken(user + "-" + role);
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: maxAge,
                sameSite: "strict",
            });
            res.status(200).json(role);
        }
    }

    // CODE FINAL ... (enlever tout le bloc if) //TODO
});

// Route pour l'inscription du premier administrateur
const { isInit } = require("../middlewares/auth");
router.post("/register-first-admin", verifyToken, isInit, async (req, res) => {
    const { loginENT, nom, prenom } = req.body;

    if (!loginENT || !nom || !prenom) {
        return res.status(400).json("Veuillez remplir tous les champs");
    }

    // Double check just in case
    if (await haveAdmin()) {
        return res.status(403).json("Un administrateur existe déjà");
    }

    const sqlCheck = `SELECT count(*) as count FROM Professeur WHERE loginENT = ?`;
    db.get(sqlCheck, [loginENT], (err, row) => {
        if (err) return res.status(500).json(err.message);

        if (row.count > 0) {
            // Update existing teacher to be admin (not useful normaly because the db is empty at the beginning)
            const sqlUpdate = `UPDATE Professeur SET nom = ?, prenom = ?, administrateur = 1 WHERE loginENT = ?`;
            db.run(sqlUpdate, [nom, prenom, loginENT], (err) => {
                if (err) return res.status(500).json(err.message);
                res.status(200).json({ message: "Administrateur créé avec succès. Veuillez vous reconnecter." });
            });
        } else {
            // Create new teacher as admin
            const sqlInsert = `INSERT INTO Professeur (loginENT, nom, prenom, administrateur) VALUES (?, ?, ?, 1)`;
            db.run(sqlInsert, [loginENT, nom, prenom], (err) => {
                if (err) return res.status(500).json(err.message);
                res.status(200).json({ message: "Administrateur créé avec succès. Veuillez vous reconnecter." });
            });
        }
    });
});

//Route pour se déconnecter
router.post("/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ succès: "Déconnecté" });
});

module.exports = router;
