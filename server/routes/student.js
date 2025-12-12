const express = require("express");
const {
  verifyToken,
  isAdmin,
  isAdminOrTeacher,
} = require("../middlewares/auth");
const db = require("../database/db");
const router = express.Router();
const { importExcelInDB } = require("../utils/student");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
// exceljs import not needed here as it is used in utils

/*****************************************
 *           Méthodes DELETE
 *****************************************/

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

/*****************************************
 *             Méthodes GET
 *****************************************/

//Sélection de tous les étudiants
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

/*****************************************
 *             Méthodes POST
 *****************************************/

//Récupération d'un étudiant avec un id particulier ainsi que les RSE et matières associées
router.get("/:id", verifyToken, isAdmin, (req, res) => {
  let id = req.params.id.substring(1);
  let sql = `SELECT * FROM Eleve WHERE numero = ?`;
  let result = [];
  db.all(sql, [id], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    result = rows;
  });

  sql =
    "SELECT * FROM RSE WHERE code IN (SELECT codeRSE FROM RSEAnnee WHERE numeroEtudiant = ?)";
  db.all(sql, [id], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    let rse = {};
    for (let i in rows) {
      rse[i["code"]] = i["libelle"];
    }
    result.push(rse);
  });

  sql = "SELECT codeMatiere FROM RelationMatiereEleve WHERE numeroEleve = ?";
  db.all(sql, [id], (err, rows) => {
    if (err) return console.error(err.message);

    let matiere = [];
    for (let i of rows) {
      matiere.push(i["codeMatiere"]);
    }
    result.push(matiere);
    res.status(200).json(result);
  });
});

router.post("/", verifyToken, isAdmin, (req, res) => {
  let { number, login, name, forname, promo, td, tp, promop, tdp, tpp } =
    req.body;
  const sql = `INSERT INTO Eleve (numero, loginENT, Promo, groupeTD, groupeTP, nom, prenom, promoPair, groupeTDPair, groupeTPPair)
VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [number, login, name, forname, promo, td, tp, promop, tdp, tpp],
    (err) => {
      if (err) return console.error(err.message);

      console.log("Values have been add successfully.");
    }
  );
});

//Publication d'une liste d'étudiants
router.post("/studentList", verifyToken, isAdmin, (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "Error processing the file" });
    }

    console.log("DEBUG - FIELDS REÇUS :", JSON.stringify(fields, null, 2));
    console.log("DEBUG - FILES REÇUS :", files);
    console.log(
      "DEBUG - Type de files.file :",
      Array.isArray(files.file) ? "Array" : typeof files.file
    );

    const fileObject = files.file ? files.file[0] : null;
    const promo = fields.promo ? fields.promo[0] : null;

    if (!fileObject || !promo) {
      return res.status(400).json({ error: "Missing file or required fields" });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    // Get extension of file
    console.log("fileObject", fileObject);
    const fileExtension = path.extname(fileObject.originalFilename);
    const fileName = `${promo}_${timestamp}${fileExtension}`;
    // Fix: Go up one level from 'routes' to 'server' then 'upload'
    const targetPath = path.join(__dirname, "../upload", fileName);

    // Copy file to the upload directory
    fs.copyFile(fileObject.filepath, targetPath, async (err) => {
      if (err) {
        console.error("Error saving file:", err);
        return res.status(500).json({ error: "Error saving the file" });
      }
      let result;
      console.log("fileExtension", fileExtension);
      switch (fileExtension) {
        case ".xlsx":
        case ".csv":
          // import .xlsx or .csv in DB
          // Fix: Add await
          result = await importExcelInDB(targetPath, fileExtension, promo);
          if (!result.success) {
            return res.status(500).json({ error: result.message });
          }
          return res.status(200).json({
            message: result.message,
          });
        case ".pdf":
          // For PDF files, just confirm the upload
          return res.status(200).json({
            message: "PDF file uploaded successfully",
          });
        default:
          return res.status(500).json({ error: "Unsupported file type" });
      }
    });
  });
});

/*****************************************
 *           Méthodes UPDATE
 *****************************************/

//Mise à jour des informations d'un élève
router.put("/", verifyToken, isAdmin, (req, res) => {
  const { number, name, forname, promo, td, tp } = req.body;
  const sql = `UPDATE Eleve SET nom = ?, prenom = ?, promo = ?, groupeTD = ?, groupeTP = ? WHERE numero = ?`;

  db.run(sql, [name, forname, promo, td, tp, number], (err) => {
    if (err) return res.status(401).json(err.message);

    res.status(200).json("L'élève a été mis à jour avec succès.");
  });
});

module.exports = router;
