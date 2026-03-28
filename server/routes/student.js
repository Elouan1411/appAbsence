const express = require("express");
const { verifyToken, isAdmin, isAdminOrTeacher } = require("../middlewares/auth");
const db = require("../database/db");
const router = express.Router();
const { importExcelInDB } = require("../utils/student");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const { error } = require("console");
// exceljs import not needed here as it is used in utils

/*****************************************
 *           DELETE Methods
 *****************************************/

// Deleting a student
router.delete("/:id", verifyToken, isAdmin, (req, res) => {
    const id = req.params.id;
    const sql = `DELETE from Eleve WHERE numero == ?`;
    db.run(sql, [id], (err) => {
        if (err) {
            return res.status(401).json(err.message);
        }
        res.status(200).json("L'élève a été supprimé avec succès.");
    });
});

/*****************************************
 *             GET Methods
 *****************************************/

router.get("/search", verifyToken, isAdminOrTeacher, (req, res) => {
    const query = req.query.q;

    if (!query || query.length < 2) {
        return res.status(200).json([]);
    }
    const sql = `
        SELECT numero, nom, prenom, promo, loginENT 
        FROM Eleve 
        WHERE numero LIKE ? 
           OR nom LIKE ? 
           OR prenom LIKE ? 
           OR loginENT LIKE ?
        LIMIT 10
    `;

    const searchTerm = `%${query}%`;

    db.all(sql, [searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) {
            console.error("Erreur recherche:", err.message);
            return res.status(500).json({ error: "Erreur lors de la recherche" });
        }
        res.status(200).json(rows);
    });
});

// Selecting all students
router.get("/all", verifyToken, isAdminOrTeacher, (req, res) => {
    let body = req.body;

    let sql = "SELECT * FROM Eleve";
    let params = [];
    let conditions = [];

    // White list of allowed columns to prevent SQL injection via column names
    const allowedColumns = ["numero", "loginENT", "Promo", "groupeTD", "groupeTP", "nom", "prenom", "promoPair", "groupeTDPair", "groupeTPPair"];

    for (let key in body) {
        if (allowedColumns.includes(key) && body[key]) {
            conditions.push(`${key} LIKE ?`);
            params.push(`%${body[key]}%`);
        }
    }

    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    db.all(sql, params, (err, rows) => {
        if (err) return console.error(err.message);
        let data = rows;

        if (data.length === 0) {
            return res.status(200).json([]);
        }

        sql = "SELECT * FROM RSE WHERE code IN ( SELECT codeRSE FROM RSEAnnee WHERE numeroEtudiant = ?)";
        let compteur = 0;
        for (let i of data) {
            db.all(sql, [i["numero"]], (err, rows) => {
                if (err) return console.error(err.message);
                let rse = {};
                for (let j of rows) {
                    rse[j["code"]] = j["libelle"];
                }
                i["RSE"] = rse;
                compteur++;
                if (compteur == data.length) {
                    res.status(200).json(data);
                    return;
                }
            });
        }
    });
});

router.get("/allID", verifyToken, isAdmin, (req, res) => {
    const sql = "SELECT numero FROM Eleve";

    db.all(sql, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Erreur de récupération ID" });
        }
        return res.status(200).json(data);
    });
});

router.get("/count", verifyToken, isAdmin, (req, res) => {
    const sql = "SELECT COUNT(numero) AS nombre FROM Eleve";

    db.all(sql, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Erreur de récupération du nombre d'étudiant" });
        }
        return res.status(200).json(data);
    });
});

/*****************************************
 *             POST Methods
 *****************************************/

// Retrieving a student with a specific id as well as the associated RSE and subjects
router.get("/:id", verifyToken, isAdmin, (req, res) => {
    let id = req.params.id;
    let sqlStudent = `SELECT * FROM Eleve WHERE numero = ?`;
    let sqlRSE = "SELECT * FROM RSE WHERE code IN (SELECT codeRSE FROM RSEAnnee WHERE numeroEtudiant = ?)";

    db.all(sqlStudent, [id], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Database error" });
        }

        if (!rows || rows.length === 0) {
            return res.status(200).json({});
        }
        let result = rows[0];
        db.all(sqlRSE, [id], (errRSE, rowsRSE) => {
            if (errRSE) {
                console.error(errRSE.message);
                return res.status(500).json({ error: "Database error" });
            }

            result["rse"] = rowsRSE;

            res.status(200).json(result);
        });
    });
});

router.post("/add", verifyToken, isAdmin, (req, res) => {
    let { numeroEtudiant, loginENT, nom, prenom, promo, groupeTD, groupeTP, rse = [] } = req.body;

    if (promo) promo = promo.toUpperCase();
    if (groupeTD) groupeTD = groupeTD.toUpperCase();
    if (groupeTP) groupeTP = groupeTP.toUpperCase();

    const handleRSE = () => {
        if (!Array.isArray(rse) || rse.length === 0) return;

        rse.forEach((element) => {
            const sqlRSE = "INSERT INTO RSEAnnee (numeroEtudiant, codeRSE) VALUES (?, ?)";
            if (element && element.code) {
                db.run(sqlRSE, [numeroEtudiant, element.code], (err) => {
                    if (err) console.error("Erreur ajout RSE:", err.message);
                });
            }
        });
    };

    const sqlCheck = `SELECT count(*) as count FROM Eleve WHERE numero = ?`;

    db.get(sqlCheck, [numeroEtudiant], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Erreur serveur vérification." });
        }

        if (row.count > 0) {
            const sqlUpdate = `UPDATE Eleve 
                               SET loginENT = ?, nom = ?, prenom = ?, Promo = ?, 
                                   groupeTD = ?, groupeTP = ?, promoPair = ?, 
                                   groupeTDPair = ?, groupeTPPair = ?
                               WHERE numero = ?`;

            db.run(sqlUpdate, [loginENT, nom, prenom, promo, groupeTD, groupeTP, promo, groupeTD, groupeTP, numeroEtudiant], function (err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: "Erreur mise à jour." });
                }
                handleRSE();

                res.status(200).json({ message: "Mise à jour effectuée." });
            });
        } else {
            const sqlInsert = `INSERT INTO Eleve (numero, loginENT, nom, prenom, Promo, groupeTD, groupeTP, promoPair, groupeTDPair, groupeTPPair)
                               VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            db.run(sqlInsert, [numeroEtudiant, loginENT, nom, prenom, promo, groupeTD, groupeTP, promo, groupeTD, groupeTP], function (err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: "Erreur insertion." });
                }
                handleRSE();
                res.status(201).json({ message: "Étudiant ajouté." });
            });
        }
    });
});

// Publishing a student list
router.post("/studentList", verifyToken, isAdmin, (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        if (err) {
            console.error("Error parsing form:", err);
            return res.status(500).json({ error: "Error processing the file" });
        }

        const fileObject = files.file ? files.file[0] : null;
        const promo = fields.promo ? fields.promo[0] : null;

        if (!fileObject || !promo) {
            return res.status(400).json({ error: "Missing file or required fields" });
        }

        // Generate a unique filename
        const timestamp = Date.now();
        // Get extension of file

        const fileExtension = path.extname(fileObject.originalFilename);
        const fileName = `${promo}_${timestamp}${fileExtension}`;
        const targetPath = path.join(__dirname, "../upload/student-list", fileName);

        // Copy file to the upload directory
        fs.copyFile(fileObject.filepath, targetPath, async (err) => {
            if (err) {
                console.error("Error saving file:", err);
                return res.status(500).json({ error: "Error saving the file" });
            }
            let result;

            switch (fileExtension) {
                case ".xlsx":
                case ".csv":
                    // import .xlsx or .csv in DB
                    result = await importExcelInDB(targetPath, fileExtension, promo);
                    if (!result.success) {
                        return res.status(500).json({ error: result.message });
                    }
                    return res.status(200).json({
                        message: result.message,
                    });
                case ".pdf":
                    // For PDF files, just confirm the upload
                    return res.status(200).json({
                        message: "PDF file uploaded successfully",
                    });
                default:
                    return res.status(500).json({ error: "Unsupported file type" });
            }
        });
    });
});

/*****************************************
 *           UPDATE Methods
 *****************************************/

// Updating a student's information
router.put("/", verifyToken, isAdmin, (req, res) => {
    let { nom, prenom, promo, groupeTD, groupeTP, loginENT, groupeTDPair, groupeTPPair, promoPair, numeroEtudiant } = req.body;

    if (promo) promo = promo.toUpperCase();
    if (groupeTD) groupeTD = groupeTD.toUpperCase();
    if (groupeTP) groupeTP = groupeTP.toUpperCase();
    if (promoPair) promoPair = promoPair.toUpperCase();
    if (groupeTDPair) groupeTDPair = groupeTDPair.toUpperCase();
    if (groupeTPPair) groupeTPPair = groupeTPPair.toUpperCase();

    const sql = `UPDATE Eleve SET nom = ?, prenom = ?,loginENT = ?, promo = ?, groupeTD = ?, groupeTP = ?, promoPair = ?, groupeTDPair = ?, groupeTPPair = ? WHERE numero = ?`;

    db.run(sql, [nom, prenom, loginENT, promo, groupeTD, groupeTP, promoPair, groupeTDPair, groupeTPPair, numeroEtudiant], (err) => {
        if (err) return res.status(401).json(err.message);

        res.status(200).json("L'élève a été mis à jour avec succès.");
    });
});

module.exports = router;
