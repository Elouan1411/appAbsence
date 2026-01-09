const express = require("express");
const {
  verifyToken,
  isAdminOrTeacher,
  isTeacher,
  isAdmin,
} = require("../middlewares/auth");
const router = express.Router();
const db = require("../database/db");

/*****************************************
 *             Méthodes GET
 *****************************************/

//Sélection de tous les appels
router.get("/", verifyToken, isAdminOrTeacher, (req, res) => {
  const sql = "SELECT * FROM Appel";
  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);

    res.status(200).json(rows);
  });
});

//Sélection des appels d'un enseignant
router.get("/:login", verifyToken, isAdminOrTeacher, (req, res) => {
  let login = req.params.login.substring(1);
  const sql =
    "SELECT idAppel, debut, fin, loginProfesseur, libelle FROM Appel, Matiere WHERE loginProfesseur = ? AND Appel.codeMatiere = Matiere.code";
  db.all(sql, [login], (err, rows) => {
    if (err) return console.error(err.message);

    console.log(rows);
    res.status(200).json(rows);
  });
});

//Sélection des informations d'un appel à partir d'un id d'appel
router.get("/info/:id", verifyToken, isTeacher, (req, res) => {
  const sql = "SELECT * FROM Appel WHERE idAppel = ?";

  db.all(sql, [id], (err, rows) => {
    if (err) return console.error(err.message);

    res.status(200).json(rows);
  });
});

/*****************************************
 *             Méthodes POST
 *****************************************/

// Publication d'un appel
router.post("/", verifyToken, isAdminOrTeacher, (req, res) => {
  const { start, end, loginProf, code } = req.body;
  let sql = `INSERT INTO Appel (debut, fin, loginProfesseur, codeMatiere)
                        VALUES(?, ?, ?, ?)`;
  db.run(sql, [start, end, loginProf, code], function (err) {
    if (err) return console.error(err.message);

    res.status(200).json({ id: this.lastID });
  });
});

/*****************************************
 *            Méthodes UPDATE
 *****************************************/

router.put("/presence", verifyToken, isAdmin, (req, res) => {
  const { number, code, presence } = req.body;
  const sql = `UPDATE RelationMatiereEleve SET presenceObligatoire = ? WHERE codeMatiere = ? AND numeroEleve = ?`;

  db.run(sql, [presence, code, number], (err) => {
    if (err) return res.status(401).json(err.message);

    res.status(200).json("La présence a bien été mise à jour.");
  });
});

module.exports = router;
