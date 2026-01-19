const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const { isAdminOrOwner, isAdminOrTeacher, verifyToken, isAdmin } = require("../middlewares/auth");

/*****************************************
 *            Méthodes GET
 *****************************************/

//Récupération de toutes les absences
router.get("/", verifyToken, isAdmin, (req, res) => {
    const sql = `
    SELECT A.*, Ap.debut, Ap.fin, Ap.codeMatiere, Ap.loginProfesseur 
    FROM Absence A
    JOIN Appel Ap ON A.idAppel = Ap.idAppel`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

router.get("/:id", verifyToken, isAdmin, (req, res) => {
    const id = req.params.id;
    const sql = `SELECT Appel.debut, Appel.fin, Professeur.nom, Professeur.prenom, Matiere.libelle,EXISTS (
        SELECT 1
        FROM JustificationAbsence
        WHERE JustificationAbsence.idAbsJustifiee = Absence.idAbsence
    ) AS justifie, groupeTD,groupeTP, Appel.promo
FROM Absence 
INNER JOIN Appel ON Absence.idAppel = Appel.idAppel 
INNER JOIN Professeur ON Appel.loginProfesseur = Professeur.loginENT
INNER JOIN Matiere ON Appel.codeMatiere = Matiere.code WHERE numeroEtudiant = ?`;
    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json(err);
        }
        return res.status(200).json(rows);
    });
});

// Récupération des absences concernant un login
router.get("/:login", verifyToken, isAdminOrOwner("login"), (req, res) => {
    const login = req.params.login.substring(1);

    const sql = `
    SELECT 
      A.idAbsence,
      A.numeroEtudiant,
      A.login,
      Ap.debut,
      Ap.fin,
      Ap.codeMatiere,
      M.libelle as nomMatiere
    FROM Absence A
    JOIN Appel Ap ON A.idAppel = Ap.idAppel
    LEFT JOIN Matiere M ON Ap.codeMatiere = M.code
    WHERE A.login = ?
  `;

    db.all(sql, [login], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// Récupération des absences n'ayant pas de justificatif
router.get("/unjustified/:login", verifyToken, isAdminOrOwner("login"), (req, res) => {
    const login = req.params.login.substring(1);
    // we search for absences that have no justification or justification with status 3
    const sql = `
    SELECT 
      A.idAbsence,
      A.numeroEtudiant,
      A.login,
      Ap.debut,
      Ap.fin,
      Ap.codeMatiere,
      Ap.fin,
      Ap.codeMatiere,
      M.libelle as nomMatiere,
      (SELECT motifValidite FROM JustificationAbsence J 
       WHERE J.numeroEtudiant = A.numeroEtudiant 
       AND J.debut <= Ap.debut 
       AND J.fin >= Ap.fin
       AND J.validite = 3
       LIMIT 1) as motifValidite
    FROM Absence A
    JOIN Appel Ap ON A.idAppel = Ap.idAppel
    LEFT JOIN Matiere M ON Ap.codeMatiere = M.code
    WHERE A.login = ?
    AND NOT EXISTS (
        SELECT 1
        FROM JustificationAbsence J
        WHERE J.numeroEtudiant = A.numeroEtudiant
        AND J.debut <= Ap.debut
        AND J.fin >= Ap.fin
        AND J.validite IN (0, 1, 2)
    )
  `;

    db.all(sql, [login], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// Récupération des absences n'ayant pas de justificatif
router.get("/in-progress/:login", verifyToken, isAdminOrOwner("login"), (req, res) => {
    const login = req.params.login.substring(1);

    const sql = `
    SELECT 
      A.idAbsence,
      A.numeroEtudiant,
      A.login,
      Ap.debut,
      Ap.fin,
      Ap.codeMatiere,
      Ap.codeMatiere,
      M.libelle as nomMatiere,
      (SELECT motif FROM JustificationAbsence J 
       WHERE J.numeroEtudiant = A.numeroEtudiant 
       AND J.debut <= Ap.debut 
       AND J.fin >= Ap.fin
       AND J.validite = 2
       LIMIT 1) as motif,
      'ABSENCE' as type
    FROM Absence A
    JOIN Appel Ap ON A.idAppel = Ap.idAppel
    LEFT JOIN Matiere M ON Ap.codeMatiere = M.code
    WHERE A.login = ?
    AND EXISTS (
        SELECT 1
        FROM JustificationAbsence J
        WHERE J.numeroEtudiant = A.numeroEtudiant
        AND J.debut <= Ap.debut
        AND J.fin >= Ap.fin
        AND J.validite IN (2)
    )
    UNION ALL
    SELECT
      J.idAbsJustifiee as idAbsence,
      J.numeroEtudiant,
      E.loginENT as login,
      J.debut,
      J.fin,
      J.fin,
      NULL as codeMatiere,
      'Justification anticipée' as nomMatiere,
      J.motif,
      'JUSTIFICATION' as type
    FROM JustificationAbsence J
    JOIN Eleve E ON J.numeroEtudiant = E.numero
    WHERE E.loginENT = ?
    AND J.validite IN (2)
    AND NOT EXISTS (
        SELECT 1
        FROM Absence A
        JOIN Appel Ap ON A.idAppel = Ap.idAppel
        WHERE A.numeroEtudiant = J.numeroEtudiant
        AND J.debut <= Ap.debut
        AND J.fin >= Ap.fin
    )
  `;

    db.all(sql, [login, login], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// Récupération des absences archivées (validées ou refusées)
router.get("/archived/:login", verifyToken, isAdminOrOwner("login"), (req, res) => {
    const login = req.params.login.substring(1);

    const sql = `
    SELECT 
      A.idAbsence,
      A.numeroEtudiant,
      A.login,
      Ap.debut,
      Ap.fin,
      Ap.codeMatiere,
      M.libelle as nomMatiere,
      (SELECT validite FROM JustificationAbsence J 
       WHERE J.numeroEtudiant = A.numeroEtudiant 
       AND J.debut <= Ap.debut 
       AND J.fin >= Ap.fin
       AND J.validite IN (0, 1)
       LIMIT 1) as validite,
      (SELECT motif FROM JustificationAbsence J 
       WHERE J.numeroEtudiant = A.numeroEtudiant 
       AND J.debut <= Ap.debut 
       AND J.fin >= Ap.fin
       AND J.validite IN (0, 1)
       LIMIT 1) as motif,
      'ABSENCE' as type
    FROM Absence A
    JOIN Appel Ap ON A.idAppel = Ap.idAppel
    LEFT JOIN Matiere M ON Ap.codeMatiere = M.code
    WHERE A.login = ?
    AND EXISTS (
        SELECT 1
        FROM JustificationAbsence J
        WHERE J.numeroEtudiant = A.numeroEtudiant
        AND J.debut <= Ap.debut
        AND J.fin >= Ap.fin
        AND J.validite IN (0, 1)
    )
    UNION ALL
    SELECT
      J.idAbsJustifiee as idAbsence,
      J.numeroEtudiant,
      E.loginENT as login,
      J.debut,
      J.fin,
      NULL as codeMatiere,
      'Justification sans absence' as nomMatiere,
      J.validite,
      J.motif,
      'JUSTIFICATION' as type
    FROM JustificationAbsence J
    JOIN Eleve E ON J.numeroEtudiant = E.numero
    WHERE E.loginENT = ?
    AND J.validite IN (0, 1)
    AND NOT EXISTS (
        SELECT 1
        FROM Absence A
        JOIN Appel Ap ON A.idAppel = Ap.idAppel
        WHERE A.numeroEtudiant = J.numeroEtudiant
        AND J.debut <= Ap.debut
        AND J.fin >= Ap.fin
    )
  `;

    db.all(sql, [login, login], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

//Récupération de l'historique des absences pour un professeur (avec détails)
router.get("/history/:login", verifyToken, isAdminOrTeacher, (req, res) => {
    let loginProf = req.params.login.substring(1);
    const sql = `
    SELECT 
      A.idAbsence,
      A.numeroEtudiant,
      A.idAppel,
      Ap.debut,
      Ap.fin,
      Ap.codeMatiere,
      M.libelle as nomMatiere,
      E.nom,
      E.prenom,
      J.validite,
      J.motif,
      J.motifValidite
    FROM Absence A
    JOIN Appel Ap ON A.idAppel = Ap.idAppel
    LEFT JOIN Eleve E ON A.numeroEtudiant = E.numero
    LEFT JOIN Matiere M ON Ap.codeMatiere = M.code
    LEFT JOIN JustificationAbsence J ON (
      A.numeroEtudiant = J.numeroEtudiant 
      AND Ap.debut >= J.debut 
      AND Ap.fin <= J.fin
    )
    WHERE Ap.loginProfesseur = ?
    ORDER BY Ap.debut DESC
  `;

    db.all(sql, [loginProf], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

//Récupération des absences pour un professeur donné
router.get("/teacher/:login", verifyToken, isAdminOrTeacher, (req, res) => {
    const loginProf = req.params.login.substring(1);

    const sql = `
    SELECT 
      A.*, 
      Ap.debut, 
      Ap.fin, 
      Ap.codeMatiere,
      Ap.loginProfesseur
    FROM Absence A
    JOIN Appel Ap ON A.idAppel = Ap.idAppel
    WHERE Ap.loginProfesseur = ?
  `;

    db.all(sql, [loginProf], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// Récupération des absences d'un appel spécifique
router.get("/appel/:idAppel", verifyToken, isAdminOrTeacher, (req, res) => {
    const { idAppel } = req.params;

    const sql = "SELECT * FROM Absence WHERE idAppel = ?";

    db.all(sql, [idAppel], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

/*****************************************
 *            Méthodes POST
 *****************************************/

// Insertion d'une nouvelle absence
router.post("/", verifyToken, isAdminOrTeacher, (req, res) => {
    const { number, idAppel, login } = req.body;

    const sql = `INSERT INTO Absence (numeroEtudiant, idAppel, login) VALUES(?, ?, ?)`;

    const stmt = db.prepare(sql);

    number.forEach((num, index) => {
        stmt.run([num, idAppel, login[index]], (err) => {
            if (err) console.error("Erreur insertion absence:", err.message);
        });
    });

    stmt.finalize();
    res.status(200).json({ message: "Absences enregistrées" });
});

/*****************************************
 *            Méthodes DELETE
 *****************************************/

// Suppression d'une absence
router.delete("/", verifyToken, isAdminOrTeacher, (req, res) => {
    const { id, idAppel } = req.body;

    const sql = `DELETE FROM Absence WHERE numeroEtudiant = ? AND idAppel = ?`;

    db.run(sql, [id, idAppel], function (err) {
        if (err) return res.status(500).json(err.message);
        res.status(200).json("L'absence a été supprimée avec succès.");
    });
});

router.get("/allID/:numeroEtudiant", verifyToken, isAdmin, (req, res) => {
    const numeroEtudiant = req.params.numeroEtudiant;
    const sql = "SELECT idAbsence FROM Absence WHERE numeroEtudiant = ?";

    db.all(sql, [numeroEtudiant], (err, rows) => {
        if (err) {
            return res.status(401).json(err);
        }

        return res.status(200).json(rows);
    });
});

/*****************************************
 *            Méthodes UPDATE
 *****************************************/

router.put("/:id", verifyToken, isAdmin, (req, res) => {
    const id = req.params.id;
    console.log("id :", id);
    const { newNumeroEtudiant, newLoginENT } = req.body;

    console.log("LoginENT: ", newLoginENT, ", numeroEtudiant: ", newNumeroEtudiant);

    const sql = "UPDATE Absence SET numeroEtudiant = ?, login = ? WHERE idAbsence = ?";
    db.run(sql, [parseInt(newNumeroEtudiant), newLoginENT, id], (err) => {
        if (err) {
            return res.status(401).json(err.message);
        }
        res.status(200).json("Les absences ont été mises à jour avec succès!");
    });
});

module.exports = router;
