const express = require("express");
const { verifyToken, isAdmin } = require("../middlewares/auth");
const router = express.Router();

/*****************************************
 *            GET Methods
 *****************************************/

// Retrieving all exemptions
router.get("/", (req, res) => {
  let sql = "SELECT * FROM RelationMatiereEleve";

  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);

    res.status(200).json(rows);
  });
});

/*****************************************
 *            POST Methods
 *****************************************/

// Inserting a new exemption
router.post("/", verifyToken, isAdmin, (req, res) => {
  let body = req.body;
  let code = body["code"];
  let number = body["number"];

  sql =
    "INSERT INTO RelationMatiereEleve (codeMatiere, numeroEleve) VALUES(?,?)";

  db.run(sql, [code, number], (err) => {
    if (err) return console.error(err.message);

    res.status(200);
  });
});
module.exports = router;
