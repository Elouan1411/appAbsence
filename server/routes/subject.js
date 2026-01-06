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
module.exports = router;
