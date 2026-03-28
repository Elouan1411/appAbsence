const express = require("express");
const { verifyToken, isAdmin, isAdminOrTeacher } = require("../middlewares/auth");
const router = express.Router();
const db = require("../database/db");
/*****************************************
 *             GET Methods
 *****************************************/

// Retrieving all CSRs (RSE)
router.get("/", verifyToken, isAdmin, (req, res) => {
    const sql = "SELECT * FROM RSE";

    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);

        res.status(200).json(rows);
    });
});

const ExcelJS = require("exceljs");
// Exporting students and their CSRs
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

        // Organize RSEAnnee data for easy access
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

        // Creating columns
        const columns = [
            { header: "Numéro Etudiant", key: "numero", width: 15 },
            { header: "Nom", key: "nom", width: 20 },
            { header: "Prénom", key: "prenom", width: 20 },
        ];

        // Adding one column per CSR type
        rseTypes.forEach((rse) => {
            columns.push({ header: rse.libelle, key: `rse_${rse.code}`, width: 15 });
        });

        worksheet.columns = columns;

        // Adding the data
        students.forEach((student) => {
            const studentRSEs = studentRSEMap[student.numero];

            if (studentRSEs && studentRSEs.size > 0) {
                const rowData = {
                    numero: student.numero,
                    nom: student.nom,
                    prenom: student.prenom,
                };

                rseTypes.forEach((rse) => {
                    rowData[`rse_${rse.code}`] = studentRSEs.has(rse.code) ? "oui" : "non";
                });

                worksheet.addRow(rowData);
            }
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
 *             POST Methods
 *****************************************/

// Retrieving CSRs for a list of students
router.post("/list", verifyToken, isAdminOrTeacher, (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(200).json({});
    }

    // Array creation -> placeholder string (["?", "?"] -> "?, ?") to prevent sql injections
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

// Inserting a new CSR
router.post("/new", verifyToken, isAdmin, (req, res) => {
    const { libelle, number } = req.body;
    let sql = `INSERT INTO RSE (libelle)
                                    VALUES(?)`;

    db.run(sql, [libelle], (err) => {
        if (err) return res.status(401).json(err.message);

        sql = "SELECT COUNT(code) FROM RSE";

        let code;

        db.all(sql, [], (err, rows) => {
            if (err) return res.status(401).json(err.message);

            code = rows[0]["COUNT(code)"];

            sql = `INSERT INTO RSEAnnee (numeroEtudiant, codeRSE)
                                        VALUES(?, ?)`;

            db.run(sql, [number, code], (err) => {
                if (err) return res.status(401).json(err.message);

                res.status(200).json([]);
            });
        });
    });
});

// Inserting a CSR for a student
router.post("/", verifyToken, isAdmin, (req, res) => {
    const { number, code } = req.body;
    const sql = `INSERT INTO RSEAnnee (numeroEtudiant, codeRSE)
                                    VALUES(?, ?)`;

    db.run(sql, [number, code], (err) => {
        if (err) return res.status(401).json(err.message);

        res.status(200).json([]);
    });
});

/*****************************************
 *            DELETE Methods
 *****************************************/
// Deleting a CSR for a student
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
// Inserting a new independent CSR
router.post("/add", verifyToken, isAdmin, (req, res) => {
    const { libelle } = req.body;
    const sql = "INSERT INTO RSE (libelle) VALUES (?)";

    db.run(sql, [libelle], function (err) {
        if (err) return res.status(500).json(err.message);
        res.status(200).json({ id: this.lastID, message: "RSE ajouté avec succès" });
    });
});

// Modifying a CSR
router.put("/update/:id", verifyToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const { libelle } = req.body;
    const sql = "UPDATE RSE SET libelle = ? WHERE code = ?";

    db.run(sql, [libelle, id], function (err) {
        if (err) return res.status(500).json(err.message);
        res.status(200).json({ message: "RSE modifiée avec succès" });
    });
});

// Deleting a CSR
router.delete("/:id", verifyToken, isAdmin, (req, res) => {
    const { id } = req.params;
    // First, associations in RSEAnnee are deleted to avoid orphans (if no CASCADE)
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
