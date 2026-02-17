const db = require("../database/db");
const exceljs = require("exceljs");
const fs = require("fs");
const path = require("path");

function importTeachersInDB(filepath) {
    return new Promise(async (resolve, reject) => {
        try {
            const workbook = new exceljs.Workbook();
            await workbook.xlsx.readFile(filepath);
            const worksheet = workbook.getWorksheet(1);

            if (!worksheet) {
                resolve({ success: false, message: "Aucune feuille trouvée dans le fichier Excel." });
                return;
            }

            const dbPromises = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const loginENT = row.getCell(1).text;
                const nom = row.getCell(2).text;
                const prenom = row.getCell(3).text;

                if (!loginENT || !nom) return;

                const p = new Promise((resolveDb, rejectDb) => {
                    const sqlCheck = `SELECT count(*) as count FROM Professeur WHERE loginENT = ?`;

                    db.get(sqlCheck, [loginENT], (err, row) => {
                        if (err) return rejectDb(err);

                        if (row.count > 0) {
                            const sqlUpdate = `UPDATE Professeur SET nom = ?, prenom = ? WHERE loginENT = ?`;
                            db.run(sqlUpdate, [nom, prenom, loginENT], function (err) {
                                if (err) rejectDb(err);
                                else resolveDb("updated");
                            });
                        } else {
                            const sqlInsert = `INSERT INTO Professeur (loginENT, nom, prenom) VALUES(?, ?, ?)`;
                            db.run(sqlInsert, [loginENT, nom, prenom], function (err) {
                                if (err) rejectDb(err);
                                else resolveDb("inserted");
                            });
                        }
                    });
                });

                dbPromises.push(p);
            });

            await Promise.all(dbPromises);

            resolve({ success: true, message: "Importation des enseignants terminée avec succès." });
        } catch (error) {
            console.error("Erreur traitement Excel Profs:", error);
            resolve({ success: false, message: "Erreur lors du traitement : " + error.message });
        }
    });
}

module.exports = { importTeachersInDB };
