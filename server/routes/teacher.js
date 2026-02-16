const express = require("express");
const { verifyToken, isAdmin, isAdminOrTeacher } = require("../middlewares/auth");
const db = require("../database/db");
const router = express.Router();
const { importTeachersInDB } = require("../utils/teacher");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const exceljs = require("exceljs");

router.get("/search", verifyToken, isAdminOrTeacher, (req, res) => {
    const query = req.query.q;

    if (!query || query.length < 2) {
        return res.status(200).json([]);
    }
    const sql = `
        SELECT loginENT, nom, prenom
        FROM Professeur 
        WHERE loginENT LIKE ? 
           OR nom LIKE ? 
           OR prenom LIKE ? 
        LIMIT 10
    `;

    const searchTerm = `%${query}%`;

    db.all(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) {
            console.error("Erreur recherche:", err.message);
            return res.status(500).json({ error: "Erreur lors de la recherche" });
        }
        res.status(200).json(rows);
    });
});

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

router.get("/:loginENT", verifyToken, isAdmin, (req, res) => {
    const loginENT = req.params.loginENT;
    const sql = "SELECT * FROM Professeur WHERE loginENT = ?";
    db.all(sql, [loginENT], (err, rows) => {
        if (err) {
            return res.status(401).json({ error: "Erreur de récupération enseignant" });
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

router.put("/:loginENT", verifyToken, isAdmin, (req, res) => {
    const loginENT = req.params.loginENT;
    const { nom, prenom } = req.body;

    if (!nom || !prenom) {
        return res.status(400).json({ error: "Nom et prénom sont requis." });
    }

    const sql = "UPDATE Professeur SET nom = ?, prenom = ? WHERE loginENT = ?";

    db.run(sql, [nom, prenom, loginENT], function (err) {
        if (err) {
            console.error("Error updating teacher:", err.message);
            return res.status(500).json({ error: "Erreur lors de la mise à jour." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Enseignant non trouvé." });
        }
        res.status(200).json({ message: "Enseignant mis à jour avec succès." });
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
router.put("/:loginENT/admin", verifyToken, isAdmin, (req, res) => {
    const loginENT = req.params.loginENT;
    const sql = "UPDATE Professeur SET administrateur = 1 WHERE loginENT = ?";

    db.run(sql, [loginENT], function (err) {
        if (err) {
            console.error("Error updating admin status:", err.message);
            return res.status(500).json({ error: "Erreur lors de la mise à jour." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Enseignant non trouvé." });
        }
        res.status(200).json({ message: "Administrateur ajouté avec succès." });
    });
});

router.delete("/:loginENT/admin", verifyToken, isAdmin, (req, res) => {
    const loginENT = req.params.loginENT;
    const sql = "UPDATE Professeur SET administrateur = 0 WHERE loginENT = ?";

    db.run(sql, [loginENT], function (err) {
        if (err) {
            console.error("Error removing admin status:", err.message);
            return res.status(500).json({ error: "Erreur lors de la mise à jour." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Enseignant non trouvé." });
        }
        res.status(200).json({ message: "Administrateur retiré avec succès." });
    });
});

router.delete("/:loginENT", verifyToken, isAdmin, (req, res) => {
    const loginENT = req.params.loginENT;
    // Also delete associated constraints, history etc? Ideally DB constraints handle cascades or we do it manually.
    // For now assuming simple delete.
    const sql = "DELETE FROM Professeur WHERE loginENT = ?";

    db.run(sql, [loginENT], function (err) {
        if (err) {
            console.error("Error deleting teacher:", err.message);
            return res.status(500).json({ error: "Erreur lors de la suppression." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Enseignant non trouvé." });
        }
        res.status(200).json({ message: "Enseignant supprimé avec succès." });
    });
});

module.exports = router;
