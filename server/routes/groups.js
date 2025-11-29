const express = require("express");
const router = express.Router();

/*****************************************
 *            Méthodes GET
 *****************************************/

// Récupération des élèves appartenant à une association TD/TP
router.get("/TDTP/:pair", (req, res) => {
  let body = req.body;
  let pair = req.params.pair.substring(1);

  let sql = "SELECT DISTINCT ";

  if (pair == true) {
    sql += "groupeTDPair ";
  } else {
    sql += "groupeTD ";
  }

  sql += "FROM Eleve ";

  for (let key in body) {
    sql += "WHERE " + key + " LIKE '%" + body[key] + "%' ";
  }

  if (pair == true) {
    sql += "ORDER BY groupeTDPair ASC";
  } else {
    sql += "ORDER BY groupeTD ASC";
  }

  let result = undefined;

  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);

    result = rows;
  });

  sql = "SELECT DISTINCT ";

  if (pair == true) {
    sql += "groupeTPPair ";
  } else {
    sql += "groupeTP ";
  }

  sql += "FROM Eleve ";

  for (let key in body) {
    sql += "WHERE " + key + " LIKE '%" + body[key] + "%' ";
  }

  if (pair == true) {
    sql += "ORDER BY groupeTPPair ASC";
  } else {
    sql += "ORDER BY groupeTP ASC";
  }

  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);

    res.status(200).json(result ? result.concat(rows) : rows);
  });
});

//Récupération des étudiants appartenant un groupe de TP donné
router.get("/tp/:pair", (req, res) => {
  let body = req.body;
  let pair = req.params.pair.substring(1);

  sql = "SELECT DISTINCT ";

  if (pair == true) {
    sql += "groupeTPPair ";
  } else {
    sql += "groupeTP ";
  }

  sql += "FROM Eleve ";

  for (let key in body) {
    sql += "WHERE " + key + " LIKE '%" + body[key] + "%' ";
  }

  if (pair == true) {
    sql += "ORDER BY groupeTPPair ASC";
  } else {
    sql += "ORDER BY groupeTP ASC";
  }

  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);

    res.status(200).json(rows);
  });
});

module.exports = router;
