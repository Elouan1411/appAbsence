const express = require("express");
const {
  verifyToken,
  isAdmin,
  isAdminOrTeacher,
} = require("../middlewares/auth");
const db = require("../database/db");
const router = express.Router();

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
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "Error processing the file" });
    }

    const fileObject = files.file ? files.file[0] : null;
    const fileType = fields.fileType ? fields.fileType[0] : null;
    const promo = fields.promo ? fields.promo[0] : null;

    if (!fileObject || !fileType || !promo) {
      return res.status(400).json({ error: "Missing file or required fields" });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = fileType === "excel" ? ".xlsx" : ".pdf";
    const fileName = `${promo}_${timestamp}${fileExtension}`;
    const targetPath = path.join(__dirname, "upload", fileName);

    // Copy file to the upload directory
    fs.copyFile(fileObject.filepath, targetPath, (err) => {
      if (err) {
        console.error("Error saving file:", err);
        return res.status(500).json({ error: "Error saving the file" });
      }

      // If it's an Excel file, process it to add students to the database
      if (fileType === "excel") {
        try {
          var workbook = XLSX.readFile(fileObject.filepath);
          var sheetName = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[sheetName];
          var json = XLSX.utils.sheet_to_json(worksheet);

          let processedCount = 0;
          const totalRecords = json.length;

          if (totalRecords === 0) {
            return res
              .status(200)
              .json({ message: "File uploaded but no student records found" });
          }

          for (let i of json) {
            i["promo"] = promo;
            if (i["promoPair"] == undefined) {
              i["promoPair"] = i["promo"];
              i["groupeTDPair"] = i["groupeTD"];
              i["groupeTPPair"] = i["groupeTP"];
            }
            let elements = [];
            for (let j in i) {
              elements.push(i[j]);
            }
            const sql = `INSERT INTO Eleve (numero, loginENT, nom, prenom, Promo, groupeTD, groupeTP, promoPair, groupeTDPair, groupeTPPair)
                                                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            db.run(sql, elements, (err) => {
              processedCount++;

              if (err) {
                console.error("Error inserting student:", err);
              } else {
                console.log("Student added successfully.");
              }

              // If all records processed, send response
              if (processedCount === totalRecords) {
                return res.status(200).json({
                  message: "Students processed and file uploaded successfully",
                  path: fileName,
                });
              }
            });
          }
        } catch (error) {
          console.error("Error processing Excel file:", error);
          return res
            .status(500)
            .json({ error: "Error processing the Excel file" });
        }
      } else {
        // For PDF files, just confirm the upload
        return res.status(200).json({
          message: "PDF file uploaded successfully",
          path: fileName,
        });
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
