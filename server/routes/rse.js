const express = require("express");
const { verifyToken, isAdmin } = require("../middlewares/auth");
const router = express.Router();
/*****************************************
 *             Méthodes GET
 *****************************************/

//Récupération de tous les RSE
router.get("/", verifyToken, isAdmin, (req, res) => {
  const sql = "SELECT * FROM RSE";

  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);

    res.status(200).json(rows);
  });
});

/*****************************************
 *             Méthodes POST
 *****************************************/

//Insertion d'un nouveau RSE
router.post("/new", verifyToken, isAdmin, (req, res) => {
  const { libelle, number } = req.body;
  let sql = `INSERT INTO RSE (libelle)
                                    VALUES(?)`;

  db.run(sql, [libelle], (err) => {
    if (err) return console.log(err.message);

    sql = "SELECT COUNT(code) FROM RSE";

    let code;

    db.all(sql, [], (err, rows) => {
      if (err) return console.log(err.message);

      code = rows[0]["COUNT(code)"];

      sql = `INSERT INTO RSEAnnee (numeroEtudiant, codeRSE)
                                        VALUES(?, ?)`;

      db.run(sql, [number, code], (err) => {
        if (err) return console.log(err.message);

        res.status(200).json([]);
      });
    });
  });
});

//Insertion d'un RSE pour un étudiant
router.post("/", verifyToken, isAdmin, (req, res) => {
  const { number, code } = req.body;
  const sql = `INSERT INTO RSEAnnee (numeroEtudiant, codeRSE)
                                    VALUES(?, ?)`;

  db.run(sql, [number, code], (err) => {
    if (err) return console.log(err.message);

    console.log("Values have been add successfully.");
  });
});

/*****************************************
 *            Méthodes DELETE
 *****************************************/
//Suppression d'un RSE pour un étudiant
router.delete("/", verifyToken, isAdmin, (req, res) => {
  const { id, code } = req.body;
  const sql = `DELETE FROM RSEAnnee WHERE numeroEtudiant = ? AND codeRSE = ?`;

  db.run(sql, [id, code], (err) => {
    if (err) return res.status(401).json(err.message);

    res.status(200).json("Le RSE a été supprimé avec succès.");
  });
});
module.exports = router;
