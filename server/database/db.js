/*****************************************************
 *             Connexion à la base de donnée
 *****************************************************/
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  "./appAbsences.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) return console.error(err.message);

    console.log("connection successful.");
  }
);
