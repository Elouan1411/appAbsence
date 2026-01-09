const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const {
  isAdminOrOwner,
  isAdminOrTeacher,
  verifyToken,
  isAdmin,
} = require("../middlewares/auth");

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
      AND Ap.debut <= J.debut 
      AND Ap.fin >= J.fin
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
router.delete("/", verifyToken, isAdminOrOwner("loginProf"), (req, res) => {
  const { id, idAppel } = req.body;
  
  const sql = `DELETE FROM Absence WHERE numeroEtudiant = ? AND idAppel = ?`;
  
  db.run(sql, [id, idAppel], function(err) {
    if (err) return res.status(500).json(err.message);
    res.status(200).json("L'absence a été supprimée avec succès.");
  });
});

module.exports = router;
