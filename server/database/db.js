/*****************************************************
 *             Connexion à la base de donnée
 *****************************************************/
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.resolve(__dirname, "./appAbsences.db");

if (!fs.existsSync(dbPath)) {
    console.error("[DEBUG DB] Database file NOT FOUND at:", dbPath);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("[DEBUG DB] Connection FAILED:", err.message);
        return;
    }
});

module.exports = db;
