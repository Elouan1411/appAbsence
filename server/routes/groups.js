const express = require("express");
const db = require("../database/db");
const router = express.Router();

/*****************************************
 *            Méthodes GET
 *****************************************/

// Récuperer les differentes promos
router.get("/promo", (req, res) => {
    let sql = "SELECT DISTINCT promo FROM Eleve";
    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);
        res.status(200).json(rows);
    });
})

// Récuperer les groupes de TD/TP en fonction d'un group et d'une promo
router.get("/groups/:promo/:pair", (req, res) => {
    let promo = req.params.promo;
    let pair = req.params.pair;

    let sql = "SELECT DISTINCT ";

    if (pair == true) {
        sql += "groupeTDPair, groupeTPPair FROM Eleve WHERE promoPair = '" + promo + "'";
    } else {
        sql += "groupeTD, groupeTP FROM Eleve WHERE promo = '" + promo + "'";
    }

    
    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);
        res.status(200).json(rows);
    });
})

router.post("/:pair", (req, res) => {
  let pair = req.params.pair;
  let body = req.body; 

  let sql = "SELECT DISTINCT numero, nom, prenom,";

  if (pair == true) {
    sql += " groupeTDPair, groupeTPPair ";
  } else {
    sql += " groupeTD, groupeTP ";
  }

  sql += "FROM Eleve ";

  let conditions = [];
  for (let key in body) {
    if(body[key]) {
        conditions.push(key + " LIKE '" + body[key] + "'");
    }
  }

  if (conditions.length > 0) {
    sql += "WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY numero ASC";
  
  console.log("SQL (POST):", sql);

  db.all(sql, [], (err, rows) => {
    if (err) return console.error(err.message);
    res.status(200).json(rows);
  });
})

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
  console.log(sql);
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
