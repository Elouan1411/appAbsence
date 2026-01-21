const express = require("express");
const { verifyToken, isAdminOrTeacher } = require("../middlewares/auth");
const db = require("../database/db");
const router = express.Router();

/*****************************************
 *             Méthodes GET
 *****************************************/

//Récupération de toutes les matières
router.get("/", verifyToken, isAdminOrTeacher, (req, res) => {
  const sql = "SELECT * FROM Matiere";
  db.all(sql, [], (err, rows) => {  
    if (err) return console.error(err.message);

    res.status(200).json(rows);
  });
});

router.post("/add", verifyToken, isAdminOrTeacher, (req, res) => {
  const { libelle, promo, spair } = req.body;
  const sql = "INSERT INTO Matiere (libelle, promo, spair) VALUES (?, ?, ?)";
  
  db.run(sql, [libelle, promo, spair], function(err) {
    if (err) return res.status(500).json(err.message);
    res.status(200).json({ id: this.lastID, message: "Matière ajoutée avec succès" });
  });
});

router.post("/promo", verifyToken, isAdminOrTeacher, (req, res) => {
  const { promo, pair } = req.body;
  const sql = "SELECT * FROM Matiere WHERE promo = ? AND spair = ?";
  db.all(sql, [promo, pair], (err, rows) => {  
    if (err) return console.error(err.message);

    res.status(200).json(rows);
  });
});

//Récupération d'une matière spécifique avec son id
router.get("/:subjectId", verifyToken, isAdminOrTeacher, (req, res) => {
  const sql = "SELECT * FROM Matiere WHERE code = ?";
  let id = req.params.ID.substring(1);
  db.all(sql, [id], (err, rows) => {
    if (err) return console.error(err.message);

    res.status(200).json(rows);
  });
});
router.put("/:id", verifyToken, isAdminOrTeacher, (req, res) => {
  const { id } = req.params;
  const { libelle, promo, spair } = req.body;
  const sql = "UPDATE Matiere SET libelle = ?, promo = ?, spair = ? WHERE code = ?";
  db.run(sql, [libelle, promo, spair, id], function(err) {
    if (err) return res.status(500).json(err.message);
    res.status(200).json({ message: "Matière modifiée avec succès" });
  });
});

router.delete("/:id", verifyToken, isAdminOrTeacher, (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Matiere WHERE code = ?";
  db.run(sql, [id], function(err) {
    if (err) return res.status(500).json(err.message);
    res.status(200).json({ message: "Matière supprimée avec succès" });
  });
});

module.exports = router;
