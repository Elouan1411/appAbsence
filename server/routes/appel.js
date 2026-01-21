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

//Séletion des appels de tous les enseignant 
router.get("/all", verifyToken, isAdmin, (req, res) => {
    const sql = "SELECT idAppel, debut, fin, loginProfesseur, Professeur.nom, Professeur.prenom, libelle, Appel.codeMatiere, Appel.promo, groupeTD, groupeTP FROM Appel JOIN Matiere ON Appel.codeMatiere = Matiere.code JOIN Professeur ON Appel.loginProfesseur = Professeur.loginENT";
    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);
        res.status(200).json(rows);
    });
})

//Sélection des appels d'un enseignant
router.get("/:login", verifyToken, isAdminOrTeacher, (req, res) => {
  let login = req.params.login.substring(1);
  const sql =
    "SELECT idAppel, debut, fin, loginProfesseur, libelle, Appel.codeMatiere, Appel.promo, groupeTD, groupeTP FROM Appel, Matiere WHERE loginProfesseur = ? AND Appel.codeMatiere = Matiere.code";
  db.all(sql, [login], (err, rows) => {
    if (err) return console.error(err.message);
    res.status(200).json(rows);
  });
});

router.get("/recent/:login", verifyToken, isAdminOrTeacher, (req, res) => {
    let login = req.params.login.substring(1);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let startSemester, endSemester;

    if (currentMonth >= 8) {
        const startYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const endYear = currentMonth === 0 ? currentYear : currentYear + 1;
        startSemester = `${startYear}09010000`;
        endSemester = `${endYear}11302359`;
    } else {
        startSemester = `${currentYear}01010000`;
        endSemester = `${currentYear}08312359`;
    }

    const sql = `
        SELECT DISTINCT Appel.codeMatiere, Matiere.libelle, Appel.promo, Appel.groupeTD, Appel.groupeTP, MAX(debut) as last_date
        FROM Appel
        JOIN Matiere ON Appel.codeMatiere = Matiere.code
        WHERE loginProfesseur = ? AND debut >= ? AND debut <= ?
        GROUP BY Appel.codeMatiere, Appel.promo, Appel.groupeTD, Appel.groupeTP
        
        ORDER BY last_date DESC
        LIMIT 15
    `;
    
    db.all(sql, [login, startSemester, endSemester], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Erreur serveur" });
        }
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

router.delete("/:id", verifyToken, isAdminOrTeacher, (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Appel WHERE idAppel = ?";
    db.run(sql, [id], function (err) {
        if (err) return console.error(err.message);
        res.status(200).json("Appel supprimé avec succès");
    });
});

/*****************************************
 *             Méthodes POST
 *****************************************/

// Publication d'un appel
router.post("/", verifyToken, isAdminOrTeacher, (req, res) => {
  const { start, end, loginProf, code, promo, groupeTD, groupeTP } = req.body;
  let sql = `INSERT INTO Appel (debut, fin, loginProfesseur, codeMatiere, promo, groupeTD, groupeTP)
                        VALUES(?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [start, end, loginProf, code, promo, groupeTD, groupeTP], function (err) {
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
