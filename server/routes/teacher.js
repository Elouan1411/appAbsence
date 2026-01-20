const express = require("express");
const { verifyToken, isAdmin, isAdminOrTeacher } = require("../middlewares/auth");
const db = require("../database/db");
const router = express.Router();
const { importTeachersInDB } = require("../utils/teacher");
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

router.get("/all", verifyToken, isAdmin, (req, res) => {
    const sql = "SELECT * FROM Professeur";

    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(401).json({ error: "Erreur de récupération professeurs" });
        }
        return res.status(200).json(rows);
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

        const result = await importTeachersInDB(uploadedFile.filepath);

        fs.unlink(uploadedFile.filepath, (unlinkErr) => {
            if (unlinkErr) console.error("Erreur suppression temp:", unlinkErr);
        });

        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(500).json({ error: result.message });
        }
    });
});
module.exports = router;
