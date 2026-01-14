const express = require("express");
const { verifyToken, isAdmin, isAdminOrTeacher } = require("../middlewares/auth");
const db = require("../database/db");
const router = express.Router();
const { importExcelInDB } = require("../utils/student");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const exceljs = require("exceljs");

router.get("/allLoginENT", verifyToken, isAdmin, (req, res) => {
    const sql = "SELECT loginENT FROM Professeur";

    db.all(sql, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Erreur de récupération ID" });
        }
        return res.status(200).json(data);
    });
});

router.post("/add", verifyToken, isAdmin, (req, res) => {
    const { loginENT, nom, prenom } = req.body;

    const sqlCheck = `SELECT count(*) as count FROM Professeur WHERE loginENT = ?`;

    db.get(sqlCheck, [loginENT], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Erreur serveur vérification." });
        }

        if (row.count > 0) {
            const sqlUpdate = `UPDATE Professeur nom = ?, prenom = ? WHERE loginENT = ?`;

            db.run(sqlUpdate, [nom, prenom, loginENT], function (err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: "Erreur mise à jour." });
                }
                res.status(200).json({ message: "Mise à jour effectuée." });
            });
        } else {
            const sqlInsert = `INSERT INTO Professeur (loginENT, nom, prenom)
                               VALUES(?, ?, ?)`;

            db.run(sqlInsert, [loginENT, nom, prenom], function (err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: "Erreur insertion." });
                }
                res.status(201).json({ message: "Enseignant ajouté." });
            });
        }
    });
});

router.post("/teacherList", verifyToken, isAdmin, (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Erreur formidable:", err);
            return res.status(500).json({ error: "Erreur lors du téléchargement du fichier." });
        }

        const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!uploadedFile) {
            return res.status(400).json({ error: "Aucun fichier reçu." });
        }

        try {
            const workbook = new exceljs.Workbook();
            await workbook.xlsx.readFile(uploadedFile.filepath);
            const worksheet = workbook.getWorksheet(1);
            const dbPromises = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;
                const loginENT = row.getCell(1).text;
                const nom = row.getCell(2).text;
                const prenom = row.getCell(3).text;

                if (!loginENT || !nom) return;

                const p = new Promise((resolve, reject) => {
                    const sqlCheck = `SELECT count(*) as count FROM Professeur WHERE loginENT = ?`;

                    db.get(sqlCheck, [loginENT], (err, row) => {
                        if (err) return reject(err);

                        if (row.count > 0) {
                            const sqlUpdate = `UPDATE Professeur SET nom = ?, prenom = ? WHERE loginENT = ?`;
                            db.run(sqlUpdate, [nom, prenom, loginENT], function (err) {
                                if (err) reject(err);
                                else resolve("updated");
                            });
                        } else {
                            const sqlInsert = `INSERT INTO Professeur (loginENT, nom, prenom) VALUES(?, ?, ?)`;
                            db.run(sqlInsert, [loginENT, nom, prenom], function (err) {
                                if (err) reject(err);
                                else resolve("inserted");
                            });
                        }
                    });
                });

                dbPromises.push(p);
            });
            await Promise.all(dbPromises);

            fs.unlink(uploadedFile.filepath, (err) => {
                if (err) console.error("Erreur suppression fichier temp:", err);
            });

            res.status(200).json({ message: "Importation des enseignants terminée avec succès." });
        } catch (error) {
            console.error("Erreur traitement Excel:", error);
            res.status(500).json({ error: "Erreur lors du traitement du fichier Excel." });
        }
    });
});
module.exports = router;
