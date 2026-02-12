const express = require("express");
const { verifyToken, isAdmin } = require("../middlewares/auth");
const router = express.Router();
const db = require("../database/db");

router.get("/schema", verifyToken, isAdmin, (req, res) => {
    const sql = "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        // Concatener pour créer le fichier sql
        const schema = rows.map((row) => row.sql).join(";\n\n") + ";";

        res.setHeader("Content-Type", "application/sql");
        res.setHeader("Content-Disposition", 'attachment; filename="schema.sql"');

        return res.send(schema);
    });
});

router.get("/dump", verifyToken, isAdmin, async (req, res) => {
    try {
        const tablesQuery = "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";

        db.all(tablesQuery, [], async (err, tables) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur lors de la récupération des tables.");
            }

            let fullDump = "";

            // recup les données d'une table
            const getTableData = (tableName) => {
                return new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });
            };

            for (const table of tables) {
                fullDump += `-- Structure de la table : ${table.name}\n`;
                fullDump += `${table.sql};\n\n`;

                try {
                    const rows = await getTableData(table.name);

                    if (rows.length > 0) {
                        fullDump += `-- Données de la table : ${table.name}\n`;
                        rows.forEach((row) => {
                            const columns = Object.keys(row).join(", ");
                            const values = Object.values(row)
                                .map((val) => {
                                    if (val === null) {
                                        return "NULL";
                                    }
                                    if (typeof val === "string") {
                                        return `'${val.replace(/'/g, "''")}'`;
                                    }
                                    return val;
                                })
                                .join(", ");
                            fullDump += `INSERT INTO ${table.name} (${columns}) VALUES (${values});\n`;
                        });
                        fullDump += "\n";
                    }
                } catch (dataErr) {
                    console.error(`Erreur lors de la récupération des données pour ${table.name}:`, dataErr);
                    fullDump += `-- Erreur lors de l'export des données pour ${table.name}\n\n`;
                }
            }

            const filename = `backup_absences_${new Date().toISOString().slice(0, 10)}.sql`;
            res.setHeader("Content-Type", "application/sql");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.send(fullDump);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de l'export" });
    }
});

router.get("/raw", verifyToken, isAdmin, (req, res) => {
    const path = require("path");
    const dbPath = path.resolve(__dirname, "../database/appAbsences.db");

    res.download(dbPath, "appAbsences.db", (err) => {
        if (err) {
            console.error("Erreur lors du téléchargement de la base de données:", err);
            res.status(500).send("Erreur lors du téléchargement du fichier.");
        }
    });
});
const ExcelJS = require("exceljs");
router.get("/xlsx-tables", verifyToken, isAdmin, async (req, res) => {
    try {
        const tablesQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";

        db.all(tablesQuery, [], async (err, tables) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur lors de la récupération des tables.");
            }

            const workbook = new ExcelJS.Workbook();

            const getTableData = (tableName) => {
                return new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });
            };

            for (const table of tables) {
                try {
                    const rows = await getTableData(table.name);
                    const sheetName = table.name.substring(0, 31); // eviter bug excel
                    const worksheet = workbook.addWorksheet(sheetName);

                    if (rows.length > 0) {
                        const columns = Object.keys(rows[0]).map((key) => ({ header: key, key: key, width: 20 }));
                        worksheet.columns = columns;
                        worksheet.addRows(rows);
                    }
                } catch (dataErr) {
                    console.error(`Erreur pour ${table.name}:`, dataErr);
                    const worksheet = workbook.addWorksheet(table.name.substring(0, 31));
                    worksheet.addRow(["Erreur lors de l'export"]);
                }
            }

            const filename = `backup_tables_${new Date().toISOString().slice(0, 10)}.xlsx`;
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");

            await workbook.xlsx.write(res);
            res.end();
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de l'export Excel" });
    }
});

router.delete("/reset-specific", verifyToken, isAdmin, async (req, res) => {
    try {
        const tables = ["JustificationAbsence", "Absence", "Appel", "RSEAnnee", "Eleve"];

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            tables.forEach((table) => {
                db.run(`DELETE FROM ${table}`, (err) => {
                    if (err) {
                        console.error(`Erreur suppression ${table}:`, err);
                    }
                });
                db.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
            });

            db.run("COMMIT", (err) => {
                if (err) {
                    console.error("Erreur commit reset:", err);
                    return res.status(500).json({ error: "Erreur lors de la réinitialisation." });
                }
                res.json({ message: "Données réinitialisées avec succès (Appel, Absence, Eleve, Justif, RSE)." });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de la réinitialisation." });
    }
});

router.delete("/reset-full", verifyToken, isAdmin, async (req, res) => {
    try {
        const tables = ["JustificationAbsence", "Absence", "Appel", "RSEAnnee", "RSE", "Eleve", "Matiere", "Professeur"];

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            tables.forEach((table) => {
                db.run(`DELETE FROM ${table}`, (err) => {
                    if (err) {
                        console.error(`Erreur suppression ${table}:`, err);
                    }
                });
                db.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
            });

            db.run("COMMIT", (err) => {
                if (err) {
                    console.error("Erreur commit reset full:", err);
                    return res.status(500).json({ error: "Erreur lors de la réinitialisation complète." });
                }
                res.cookie("jwt", "", { maxAge: 1 });
                res.json({ message: "Base de données entièrement réinitialisée." });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur lors de la réinitialisation complète." });
    }
});

const formidable = require("formidable");
const fs = require("fs");

router.post("/restore", verifyToken, isAdmin, (req, res) => {
    const form = new formidable.IncomingForm({ keepExtensions: true });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error("Erreur parsing form:", err);
            return res.status(500).json({ error: "Erreur lors de l'upload du fichier." });
        }

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file) {
            return res.status(400).json({ error: "Aucun fichier fourni." });
        }

        const tables = ["JustificationAbsence", "Absence", "Appel", "RSEAnnee", "RSE", "Eleve", "Matiere", "Professeur"];

        fs.readFile(file.filepath, "utf8", (readErr, sqlContent) => {
            if (readErr) {
                console.error("Erreur lecture fichier:", readErr);
                return res.status(500).json({ error: "Erreur lors de la lecture du fichier." });
            }

            // only execute insert but not create table...
            const cleanSql = sqlContent
                .replace(/CREATE TABLE[\s\S]+?;/gi, "")
                .replace(/PRAGMA[\s\S]+?;/gi, "")
                .replace(/BEGIN TRANSACTION;/gi, "")
                .replace(/COMMIT;/gi, "");

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                tables.forEach((table) => {
                    db.run(`DELETE FROM ${table}`);
                    db.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
                });

                db.exec(cleanSql, (execErr) => {
                    if (fs.existsSync(file.filepath)) {
                        fs.unlinkSync(file.filepath);
                    }

                    if (execErr) {
                        console.error("Erreur execution SQL restore:", execErr);
                        db.run("ROLLBACK");
                        return res.status(400).json({ error: "Erreur SQL: " + execErr.message });
                    }

                    db.run("COMMIT", (commitErr) => {
                        if (commitErr) {
                            console.error("Commit error:", commitErr);
                            return res.status(500).json({ error: "Erreur lors de la validation de la restauration." });
                        }
                        res.json({ message: "Base de données restaurée avec succès." });
                    });
                });
            });
        });
    });
});

module.exports = router;
