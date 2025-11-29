const express = require("express");
const {
  verifyToken,
  isAdmin,
  isOwner,
  isAdminOrOwner,
} = require("../middlewares/auth");
const router = express.Router();

/*****************************************
 *             Méthodes GET
 *****************************************/

//Récupération des nouvelles justifications
router.get("/new", verifyToken, isAdmin, (req, res) => {
  const sql =
    "SELECT idAbsJustifiee, numeroEtudiant, debut, fin, motif, nom, prenom FROM JustificationAbsence, Eleve WHERE validite = 2 AND JustificationAbsence.numeroEtudiant = Eleve.numero";
  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);

    res.json(rows);
  });
});

// Récupération de toutes les justifications
router.get("/", verifyToken, isAdmin, (req, res) => {
  const sql =
    "SELECT idAbsJustifiee, numeroEtudiant, debut, fin, motif, validite, nom, prenom FROM JustificationAbsence, Eleve WHERE JustificationAbsence.numeroEtudiant = Eleve.numero";
  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);

    res.json(rows);
  });
});

// Récupération d'une justification particulière
router.get("/:id", verifyToken, isOwner, (req, res) => {
  let result = [];
  fs.readdir("./upload", (err, files) => {
    if (err) {
      res.status(404).json([]);
    } else {
      files.forEach((file) => {
        if (file.split("-")[0] == ID || file.split("-")[0] == ID + ".pdf") {
          result.push(file);
        }
      });
    }
  });
  const sql =
    "SELECT idAbsJustifiee, numeroEtudiant, debut, fin, motif, validite, motifValidite, nom, prenom, login FROM JustificationAbsence, Eleve WHERE idAbsJustifiee = ?";
  db.all(sql, [ID], (err, rows) => {
    if (decodedToken.pwd.split("-")[0] == rows[0]["login"]) {
      if (err) return console.error(err.message);
      rows[0]["list"] = result;
      res.status(200).json(rows[0]);
    } else {
      res.status(403);
    }
  });
});

//Récupération d'une justification particulière côté admin
router.get("/admin/:id", verifyToken, isAdmin, (req, res) => {
  let result = [];
  fs.readdir("./upload", (err, files) => {
    if (err) {
      res.status(404).json([]);
    } else {
      files.forEach((file) => {
        if (file.split("-")[0] == ID || file.split("-")[0] == ID + ".pdf") {
          result.push(file);
        }
      });
    }
  });
  const sql =
    "SELECT idAbsJustifiee, numeroEtudiant, debut, fin, motif, validite, motifValidite,nom, prenom FROM JustificationAbsence, Eleve WHERE JustificationAbsence.numeroEtudiant = Eleve.numero AND idAbsJustifiee = ?";
  db.all(sql, [ID], (err, rows) => {
    if (err) return console.error(err.message);
    rows[0]["list"] = result;

    res.status(200).json(rows[0]);
  });
});

//Récupération de toutes les absences à partir d'un login
router.get("/login/:id", verifyToken, isAdminOrOwner, (req, res) => {
  const sql = "SELECT * FROM JustificationAbsence WHERE login = ?";
  db.all(sql, [login], (err, rows) => {
    if (err) return console.error(err.message);

    res.status(200).json(rows);
  });
});

//Récupération des absences qui correspondent à un filtre
router.get("/filter", verifyToken, isAdmin, (req, res) => {
  let body = req.body;

  let sql =
    "SELECT idAbsJustifiee, numeroEtudiant, debut, fin, motif, validite, nom, prenom FROM JustificationAbsence, Eleve WHERE JustificationAbsence.numeroEtudiant = Eleve.numero ";

  let element = [];
  let start = false;
  let end = false;

  for (let key in body) {
    if (key == "debut") {
      sql += "AND " + key + " >= ? ";
      start = true;
      continue;
    }
    if (key == "fin") {
      sql += "AND " + key + " <= ? ";
      end = true;
      continue;
    }
    sql += "AND " + key + " LIKE '%" + body[key] + "%' ";
  }
  let startV = "";
  let endV = "";
  if (start) {
    let startExplode = body["debut"].split("-");
    startV = startExplode[0] + startExplode[1] + startExplode[2] + "0000";
    element.push(startV);
  }

  if (end) {
    let endExplode = body["fin"].split("-");
    endV = endExplode[0] + endExplode[1] + endExplode[2] + "2323";
    element.push(endV);
  }
  db.all(sql, element, (err, rows) => {
    if (err) return console.error(err.message);

    res.status(200).json(rows);
  });
});

/*****************************************
 *             Méthodes POST
 *****************************************/
//Publication d'une justification
router.post("/", verifyToken, isAdminOrOwner, (req, res) => {
  let body = req.body;

  let login = body["login"];
  let number = body["number"];

  let date = body["start-date"].split("-");
  let hour = body["start-time"].split(":");

  let start = date[0] + date[1] + date[2] + hour[0] + hour[1];

  date = body["end-date"].split("-");
  hour = body["end-time"].split(":");

  let end = date[0] + date[1] + date[2] + hour[0] + hour[1];
  let motif = body.justification;
  const sql = `INSERT INTO JustificationAbsence (numeroEtudiant, debut, fin, motif, validite, motifValidite, login)
                                    VALUES(?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [number, start, end, motif, 2, "", login], (err) => {
    if (err) {
      console.error(err);
      return res.status(401).json(err.message);
    }
    console.log(this.lastID);
    db.get("SELECT last_insert_rowid() as id", (err, row) => {
      if (err) {
        console.error(err.message);
      }
      res.status(200).json(row.id);
    });
  });
});

/*****************************************
 *           Méthodes UPDATE
 *****************************************/
// Validation d'une justification
router.put("/validate", verifyToken, isAdmin, (req, res) => {
  let body = req.body;
  let id = body.id;
  let validite = Number(body.value != "deny");
  let motifValidite = body.reason;
  if (motifValidite == undefined) {
    motifValidite = "";
  }

  const sql = `UPDATE JustificationAbsence SET validite = ?, motifValidite = ? WHERE idAbsJustifiee = ?`;

  db.run(sql, [validite, motifValidite, id], (err) => {
    if (err) return console.error(err.message);

    if (motifValidite == "") {
      res.status(200).json("Le motif a été validé.");
    } else {
      res.status(200).json("Le motif a été refusé.");
    }
  });
});

//Mise à jour d'une justification

router.put("/:id", verifyToken, isOwner, (req, res) => {
  let body = req.body;

  let id = req.params.ID.substring(1);
  let motif = body.motif;

  let date = body["dateDebut"].split("-");
  let heure = body["heureDebut"].split(":");

  let debut = date[0] + date[1] + date[2] + heure[0] + heure[1];

  date = body["dateFin"].split("-");
  heure = body["heureFin"].split(":");

  let fin = date[0] + date[1] + date[2] + heure[0] + heure[1];

  const sql =
    "SELECT * FROM JustificationAbsence WHERE login = ? AND idAbsJustifiee = ?";
  const login = decodedToken.pwd.split("-")[0];

  db.all(sql, [login, id], (err, rows) => {
    if (err) return console.error(err.message);
    if (rows.length > 0) {
      const sql = `UPDATE JustificationAbsence SET debut = ?, fin = ?, motif = ? WHERE idAbsJustifiee = ?`;

      db.run(sql, [debut, fin, motif, id], (err) => {
        if (err) {
          console.error(err.message);
          res.status(500);
        } else res.status(200).json("La justification a été mise à jours");
      });
    } else res.status(403);
  });
});

/*****************************************
 *           Méthodes DELETE
 *****************************************/
//Suppression justification
router.delete("/:id", verifyToken, isAdminOrOwner, (req, res) => {
  let id = req.params.id;
  let login = req.body.login;

  const sql = `DELETE FROM JustficationAbsence WHERE idAbsJustifiee = ?`;

  db.run(sql, [id], (err) => {
    if (err) return console.error(err.message);

    res.status(200).json("La justification a été supprimée avec succès.");
  });
});

module.exports = router;
