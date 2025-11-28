const express = require("express");
const {
  verifyToken,
  isAdmin,
  isAdminOrTeacher,
} = require("../middlewares/auth");
const db = require("../database/db");
const router = express.Router();

//Suppression d'un élève
router.delete("/", verifyToken, isAdmin, (req, res) => {
  const id = req.body.id;
  const sql = `DELETE from Eleve WHERE numero == ?`;
  db.run(sql, [id], (err) => {
    if (err) {
      return res.status(401).json(err.message);
    }
    res.status(200).json("L'élève a été supprimé avec succès.");
  });
});
router.get("/all", verifyToken, isAdminOrTeacher, (req, res) => {
  let body = req.body;

  let sql = "SELECT * FROM Eleve ";

  let first = true;

  for (let key in body) {
    if (first) {
      sql += "WHERE " + key + " LIKE '%" + body[key] + "%' ";
      first = false;
      continue;
    }
    sql += "AND " + key + " LIKE '%" + body[key] + "%' ";
  }

  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);
    let data = rows;
    sql =
      "SELECT * FROM RSE WHERE code IN ( SELECT codeRSE FROM RSEAnnee WHERE numeroEtudiant = ?)";
    let compteur = 0;
    for (let i of data) {
      db.all(sql, [i["numero"]], (err, rows) => {
        if (err) return console.error(err.message);
        let rse = {};
        for (let j of rows) {
          rse[j["code"]] = j["libelle"];
        }
        i["RSE"] = rse;
        compteur++;
        if (compteur == data.length) {
          res.status(200).json(data);
          return;
        }
      });
    }
  });
});
