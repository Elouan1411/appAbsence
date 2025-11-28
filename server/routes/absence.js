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

router.get("/", verifyToken, isAdmin, (req, res) => {
  const sql = "SELECT * FROM Absence";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

router.get("/:login", verifyToken, isAdminOrOwner("login"), (req, res) => {
  const login = req.params.login.substring(1);
  const sql = "SELECT * FROM Absence WHERE login = ?";
  db.all(sql, [login], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

router.get("/teacher/:login", verifyToken, isAdminOrTeacher, (req, res) => {
  let loginProf = req.params.login.substring(1);
  const sql = "SELECT * FROM Absence WHERE loginProfesseur = ?";
  db.all(sql, [loginProf], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

router.post("/", verifyToken, isAdminOrTeacher, (req, res) => {
  const { number, start, end, loginProf, code, login } = req.body;
  let sql = `INSERT INTO Absence (numeroEtudiant, debut, fin, loginProfesseur, codeMatiere, login)
                        VALUES(?, ?, ?, ?, ?, ?)`;
  number.forEach((num, index) => {
    db.run(sql, [num, start, end, loginProf, code, login[index]], (err) => {
      if (err) {
        console.error(err.message);
      }
    });
  });
  res.status(200).json([]);
});

router.delete("/", verifyToken, isAdminOrOwner("loginProf"), (req, res) => {
  const { id, loginProf, debut, fin } = req.body;
  const sql = `DELETE FROM Absence WHERE numeroEtudiant = ? AND debut = ? AND fin = ?`;
  db.run(sql, [id, debut, fin], (err) => {
    if (err) {
      return res.status(500).json(err.message);
    }
    res.status(200).json("L'absence a été supprimée avec succès.");
  });
});

module.exports = router;
