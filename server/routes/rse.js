const express = require("express");
const { verifyToken, isAdmin, isAdminOrTeacher } = require("../middlewares/auth");
const router = express.Router();
const db = require("../database/db");
/*****************************************
 *             Méthodes GET
 *****************************************/

//Récupération de tous les RSE
router.get("/", verifyToken, isAdmin, (req, res) => {
    const sql = "SELECT * FROM RSE";

    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);

        res.status(200).json(rows);
    });
});

/*****************************************
 *             Méthodes POST
 *****************************************/

// Récupération des RSE pour une liste d'étudiants
router.post("/list", verifyToken, isAdminOrTeacher, (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(200).json({});
    }

    // Création du tableau -> chaine de placeholder (["?", "?"] -> "?, ?") pour eviter les injections sql
    const placeholders = ids.map(() => "?").join(",");
    const sql = `
        SELECT ra.numeroEtudiant, r.code, r.libelle 
        FROM RSEAnnee ra
        JOIN RSE r ON ra.codeRSE = r.code
        WHERE ra.numeroEtudiant IN (${placeholders})
    `;

    db.all(sql, ids, (err, rows) => {
        if (err) {
            console.error("SQL Error in /rse/list:", err.message);
            return res.status(500).json({ error: err.message });
        }

        const rseMap = {};
        rows.forEach((row) => {
            if (!rseMap[row.numeroEtudiant]) {
                rseMap[row.numeroEtudiant] = {};
            }
            rseMap[row.numeroEtudiant][row.code] = row.libelle;
        });

        res.status(200).json(rseMap);
    });
});

//Insertion d'un nouveau RSE
router.post("/new", verifyToken, isAdmin, (req, res) => {
    const { libelle, number } = req.body;
    let sql = `INSERT INTO RSE (libelle)
                                    VALUES(?)`;

    db.run(sql, [libelle], (err) => {
        if (err) return console.log(err.message);

        sql = "SELECT COUNT(code) FROM RSE";

        let code;

        db.all(sql, [], (err, rows) => {
            if (err) return console.log(err.message);

            code = rows[0]["COUNT(code)"];

            sql = `INSERT INTO RSEAnnee (numeroEtudiant, codeRSE)
                                        VALUES(?, ?)`;

            db.run(sql, [number, code], (err) => {
                if (err) return console.log(err.message);

                res.status(200).json([]);
            });
        });
    });
});

//Insertion d'un RSE pour un étudiant
router.post("/", verifyToken, isAdmin, (req, res) => {
    const { number, code } = req.body;
    const sql = `INSERT INTO RSEAnnee (numeroEtudiant, codeRSE)
                                    VALUES(?, ?)`;

    db.run(sql, [number, code], (err) => {
        if (err) return console.log(err.message);

        console.log("Values have been add successfully.");
    });
});

/*****************************************
 *            Méthodes DELETE
 *****************************************/
//Suppression d'un RSE pour un étudiant
router.delete("/", verifyToken, isAdmin, (req, res) => {
    const { id, code } = req.body;
    const sql = `DELETE FROM RSEAnnee WHERE numeroEtudiant = ? AND codeRSE = ?`;

    db.run(sql, [id, code], (err) => {
        if (err) return res.status(401).json(err.message);

        res.status(200).json("Le RSE a été supprimé avec succès.");
    });
});
router.put("/:numeroEtudiant", verifyToken, isAdmin, (req, res) => {
    const numeroEtudiant = req.params.numeroEtudiant;
    const { rse, newNumeroEtudiant } = req.body;

    const deleteSQL = "DELETE FROM RSEAnnee WHERE numeroEtudiant = ?";
    const insertSQL = "INSERT INTO RSEAnnee (numeroEtudiant, codeRSE) VALUES(?, ?)";

    db.run(deleteSQL, [numeroEtudiant], (err) => {
        if (err) {
            return res.status(401).json(err);
        }

        const insertPromises = rse.map((element) => {
            return new Promise((resolve, reject) => {
                db.run(insertSQL, [newNumeroEtudiant, element.code], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });

        Promise.all(insertPromises)
            .then(() => {
                return res.status(200).json("Les RSE ont été mis à jour avec succès");
            })
            .catch((err) => {
                return res.status(401).json(err);
            });
    });
});
//Insertion d'un nouveau RSE (indépendant)
router.post("/add", verifyToken, isAdmin, (req, res) => {
    const { libelle } = req.body;
    const sql = "INSERT INTO RSE (libelle) VALUES (?)";

    db.run(sql, [libelle], function (err) {
        if (err) return res.status(500).json(err.message);
        res.status(200).json({ id: this.lastID, message: "RSE ajouté avec succès" });
    });
});

// Modification d'un RSE
router.put("/update/:id", verifyToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const { libelle } = req.body;
    const sql = "UPDATE RSE SET libelle = ? WHERE code = ?";

    db.run(sql, [libelle, id], function (err) {
        if (err) return res.status(500).json(err.message);
        res.status(200).json({ message: "RSE modifiée avec succès" });
    });
});

// Suppression d'un RSE
router.delete("/:id", verifyToken, isAdmin, (req, res) => {
    const { id } = req.params;
    // On supprime d'abord les associations dans RSEAnnee pour éviter les orphelins (si pas de CASCADE)
    const sqlDeleteAssoc = "DELETE FROM RSEAnnee WHERE codeRSE = ?";
    const sqlDeleteRSE = "DELETE FROM RSE WHERE code = ?";

    db.run(sqlDeleteAssoc, [id], function (err) {
        if (err) return res.status(500).json(err.message);

        db.run(sqlDeleteRSE, [id], function (err) {
            if (err) return res.status(500).json(err.message);
            res.status(200).json({ message: "RSE supprimé avec succès" });
        });
    });
});

module.exports = router;
