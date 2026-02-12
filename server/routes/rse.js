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

const ExcelJS = require("exceljs");
// Export des étudiants et leurs RSE
router.get("/export", verifyToken, isAdmin, async (req, res) => {
    try {
        const sqlStudents = "SELECT numero, nom, prenom FROM Eleve ORDER BY nom, prenom";
        const sqlRSE = "SELECT code, libelle FROM RSE ORDER BY code";
        const sqlRSEAnnee = "SELECT numeroEtudiant, codeRSE FROM RSEAnnee";

        const p1 = new Promise((resolve, reject) => {
            db.all(sqlStudents, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const p2 = new Promise((resolve, reject) => {
            db.all(sqlRSE, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const p3 = new Promise((resolve, reject) => {
            db.all(sqlRSEAnnee, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const [students, rseTypes, rseAnnee] = await Promise.all([p1, p2, p3]);

        // Organiser les données RSEAnnee pour un accès facile
        // Map<studentId, Set<rseCode>>
        const studentRSEMap = {};
        rseAnnee.forEach((row) => {
            if (!studentRSEMap[row.numeroEtudiant]) {
                studentRSEMap[row.numeroEtudiant] = new Set();
            }
            studentRSEMap[row.numeroEtudiant].add(row.codeRSE);
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("RSE Etudiants");

        // Création des colonnes
        const columns = [
            { header: "Numéro Etudiant", key: "numero", width: 15 },
            { header: "Nom", key: "nom", width: 20 },
            { header: "Prénom", key: "prenom", width: 20 },
        ];

        // Ajouter une colonne par type de RSE
        rseTypes.forEach((rse) => {
            columns.push({ header: rse.libelle, key: `rse_${rse.code}`, width: 15 });
        });

        worksheet.columns = columns;

        // Ajouter les données
        students.forEach((student) => {
            const rowData = {
                numero: student.numero,
                nom: student.nom,
                prenom: student.prenom,
            };

            const studentRSEs = studentRSEMap[student.numero] || new Set();

            rseTypes.forEach((rse) => {
                rowData[`rse_${rse.code}`] = studentRSEs.has(rse.code) ? "oui" : "non";
            });

            worksheet.addRow(rowData);
        });
        
        const filename = `export_rse_${new Date().toISOString().slice(0, 10)}.xlsx`;

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Erreur export RSE:", err);
        res.status(500).json({ error: "Erreur lors de l'export Excel" });
    }
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
