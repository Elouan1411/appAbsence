const express = require("express");
const { verifyToken, isAdmin, isAdminOrTeacher } = require("../middlewares/auth");
const db = require("../database/db");
const router = express.Router();
const { importExcelInDB } = require("../utils/student");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
// exceljs import not needed here as it is used in utils

/*****************************************
 *           Méthodes DELETE
 *****************************************/

//Suppression d'un élève
router.delete("/", verifyToken, isAdmin, (req, res) => {
    const id = req.body.id;
    const sql = `DELETE from Eleve WHERE numero == ?`;
    db.run(sql, [id], (err) => {
        if (err) {
            return res.status(401).json(err.message);
        }
        res.status(200).json("L'élève a été supprimé avec succès.");
    });
});

/*****************************************
 *             Méthodes GET
 *****************************************/

//Sélection de tous les étudiants
router.get("/all", verifyToken, isAdminOrTeacher, (req, res) => {
    let body = req.body;

    let sql = "SELECT * FROM Eleve";
    let params = [];
    let conditions = [];

    // Liste blanche des colonnes autorisées pour éviter l'injection SQL via les noms de colonnes
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

/*****************************************
 *             Méthodes POST
 *****************************************/

//Récupération d'un étudiant avec un id particulier ainsi que les RSE et matières associées
router.get("/:id", verifyToken, isAdmin, (req, res) => {
    let id = req.params.id.substring(1);
    let sql = `SELECT * FROM Eleve WHERE numero = ?`;
    let result = [];
    db.all(sql, [id], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        result = rows;
    });

    sql = "SELECT * FROM RSE WHERE code IN (SELECT codeRSE FROM RSEAnnee WHERE numeroEtudiant = ?)";
    db.all(sql, [id], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        let rse = {};
        for (let i in rows) {
            rse[i["code"]] = i["libelle"];
        }
        result.push(rse);
    });

    sql = "SELECT codeMatiere FROM RelationMatiereEleve WHERE numeroEleve = ?";
    db.all(sql, [id], (err, rows) => {
        if (err) return console.error(err.message);

        let matiere = [];
        for (let i of rows) {
            matiere.push(i["codeMatiere"]);
        }
        result.push(matiere);
        res.status(200).json(result);
    });
});

router.post("/add", verifyToken, isAdmin, (req, res) => {
    const { numeroEtudiant, loginENT, nom, prenom, promo, groupeTD, groupeTP, rse = [] } = req.body;

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

//Publication d'une liste d'étudiants
router.post("/studentList", verifyToken, isAdmin, (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        if (err) {
            console.error("Error parsing form:", err);
            return res.status(500).json({ error: "Error processing the file" });
        }

        console.log("DEBUG - FIELDS REÇUS :", JSON.stringify(fields, null, 2));
        console.log("DEBUG - FILES REÇUS :", files);
        console.log("DEBUG - Type de files.file :", Array.isArray(files.file) ? "Array" : typeof files.file);

        const fileObject = files.file ? files.file[0] : null;
        const promo = fields.promo ? fields.promo[0] : null;

        if (!fileObject || !promo) {
            return res.status(400).json({ error: "Missing file or required fields" });
        }

        // Generate a unique filename
        const timestamp = Date.now();
        // Get extension of file
        console.log("fileObject", fileObject);
        const fileExtension = path.extname(fileObject.originalFilename);
        const fileName = `${promo}_${timestamp}${fileExtension}`;
        // Fix: Go up one level from 'routes' to 'server' then 'upload'
        const targetPath = path.join(__dirname, "../upload/student-list", fileName);

        // Copy file to the upload directory
        fs.copyFile(fileObject.filepath, targetPath, async (err) => {
            if (err) {
                console.error("Error saving file:", err);
                return res.status(500).json({ error: "Error saving the file" });
            }
            let result;
            console.log("fileExtension", fileExtension);
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
 *           Méthodes UPDATE
 *****************************************/

//Mise à jour des informations d'un élève
router.put("/", verifyToken, isAdmin, (req, res) => {
    const { number, name, forname, promo, td, tp } = req.body;
    const sql = `UPDATE Eleve SET nom = ?, prenom = ?, promo = ?, groupeTD = ?, groupeTP = ? WHERE numero = ?`;

    db.run(sql, [name, forname, promo, td, tp, number], (err) => {
        if (err) return res.status(401).json(err.message);

        res.status(200).json("L'élève a été mis à jour avec succès.");
    });
});

module.exports = router;
