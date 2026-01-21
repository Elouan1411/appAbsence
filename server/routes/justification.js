const express = require("express");
const { verifyToken, isAdmin, isOwner, isAdminOrOwner } = require("../middlewares/auth");
const router = express.Router();
const db = require("../database/db");
const fs = require("fs");
const path = require("path");
const { validateJustificationInput } = require("../utils/justificationSecurity");

/*****************************************
 *             Méthodes GET
 *****************************************/

//Récupération des nouvelles justifications
router.get("/new", verifyToken, isAdmin, (req, res) => {
    // const sql =
    //   "SELECT idAbsJustifiee,JustificationAbsence.numeroEtudiant,debut,fin,motif,nom,prenom, dateDemande FROM JustificationAbsence JOIN Eleve ON JustificationAbsence.numeroEtudiant = Eleve.numero WHERE JustificationAbsence.validite = 2 GROUP BY dateDemande,numeroEtudiant;";
    const sql = `SELECT 
    idAbsJustifiee,
    numeroEtudiant,
    nom,
    prenom,
    groupeTD,
    dateDemande,
    motif,
    validite,
    json_group_array(
        json_object(
            'id', JustificationAbsence.idAbsJustifiee,
            'debut', JustificationAbsence.debut, 
            'fin', JustificationAbsence.fin
        )
    ) as liste_creneaux
FROM JustificationAbsence
LEFT JOIN Eleve ON JustificationAbsence.numeroEtudiant = Eleve.numero
WHERE JustificationAbsence.validite == 2
GROUP BY JustificationAbsence.dateDemande, JustificationAbsence.numeroEtudiant
ORDER BY JustificationAbsence.dateDemande DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);
        res.json(rows);
    });
});

router.get("/count", verifyToken, isAdmin, (req, res) => {
    // const sql =
    //   "SELECT idAbsJustifiee,JustificationAbsence.numeroEtudiant,debut,fin,motif,nom,prenom, dateDemande FROM JustificationAbsence JOIN Eleve ON JustificationAbsence.numeroEtudiant = Eleve.numero WHERE JustificationAbsence.validite = 2 GROUP BY dateDemande,numeroEtudiant;";
    const sql = `SELECT COUNT(*) as total
FROM (
    SELECT 1 
    FROM JustificationAbsence
    WHERE validite = 2
    GROUP BY dateDemande, numeroEtudiant
);`;
    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);
        res.json(rows);
    });
});

// Récupération de toutes les justifications
router.get("/", verifyToken, isAdmin, (req, res) => {
    const sql =
        "SELECT idAbsJustifiee, numeroEtudiant, nom, prenom, debut, fin, motif, validite,  FROM JustificationAbsence, Eleve WHERE JustificationAbsence.numeroEtudiant = Eleve.numero";
    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);

        res.json(rows);
    });
});
//Récupération des documents justificatifs d'une justification
router.get("/documents/:id", verifyToken, isAdmin, (req, res) => {
    const ID = req.params.id;
    fs.readdir("./upload/justification", (err, files) => {
        if (err) {
            res.status(404).json([]);
        } else {
            const result = files.filter((file) => {
                const fileId = file.split("-")[0];
                return fileId == ID || file === `${ID}.pdf`;
            });
            res.status(200).json(result);
        }
    });
});

// Téléchargement d'un justificatif avec renommage pour l'étudiant
router.get("/download/:filename", verifyToken, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../upload/justification", filename);

    // Basic security
    if (filename.includes("..") || filename.includes("/")) {
        return res.status(400).send("Invalid filename");
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }

    // Extract parts from id-docX-date.pdf
    const parts = filename.split("-");
    const justificationId = parts[0];

    if (!justificationId) {
        return res.status(400).send("Invalid file format");
    }

    const userLogin = req.user.pwd.split("-")[0];
    const userRole = req.user.pwd.split("-")[1];

    // Check ownership
    const sql = "SELECT login FROM JustificationAbsence WHERE idAbsJustifiee = ?";
    db.get(sql, [justificationId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Server error");
        }

        if (!row) {
            return res.status(404).send("Justification not found");
        }

        // Allow if admin or if the user is the owner
        if (userRole === "admin" || row.login === userLogin) {
            let downloadName = filename;

            if (parts.length >= 2 && parts[1].startsWith("doc")) {
                const docPart = parts[1];
                const docIndex = parseInt(docPart.replace("doc", ""), 10);

                if (!isNaN(docIndex)) {
                    const ext = path.extname(filename);
                    downloadName = `Justificatif ${docIndex}${ext}`;
                }
            }

            res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
            res.download(filePath, downloadName, (err) => {
                if (err) {
                    console.error("Error downloading file:", err);
                    if (!res.headersSent) {
                        res.status(500).send("Error downloading file");
                    }
                }
            });
        } else {
            return res.status(403).send("Unauthorized access to this file");
        }
    });
});

// Récupération d'une justification particulière
router.get("/:id", verifyToken, (req, res) => {
    const ID = req.params.id;
    let result = [];

    const sendResponse = (fileList) => {
        const sql =
            "SELECT idAbsJustifiee, numeroEtudiant, debut, fin, motif, validite, motifValidite, nom, prenom, login FROM JustificationAbsence JOIN Eleve ON JustificationAbsence.numeroEtudiant = Eleve.numero WHERE idAbsJustifiee = ?";

        db.all(sql, [ID], (err, rows) => {
            if (err) return res.status(500).json(err.message);
            if (rows.length === 0) return res.status(404).json("Justification non trouvée");

            const userLogin = req.user.pwd.split("-")[0];

            if (rows[0]["login"] === userLogin) {
                rows[0]["list"] = fileList;
                res.status(200).json(rows[0]);
            } else {
                res.status(403).json("Accès non autorisé à cette justification");
            }
        });
    };

    fs.readdir("./upload/justification", (err, files) => {
        if (err) {
            sendResponse([]);
        } else {
            files.forEach((file) => {
                if (file.split("-")[0] == ID) {
                    result.push(file);
                }
            });
            sendResponse(result);
        }
    });
});

//Récupération d'une justification particulière côté admin
router.get("/admin/:id", verifyToken, isAdmin, (req, res) => {
    const ID = req.params.id;
    let result = [];
    fs.readdir("./upload/justification", (err, files) => {
        if (err) {
            res.status(404).json([]);
        } else {
            files.forEach((file) => {
                if (file.split("-")[0] == ID || file.split("-")[0] == ID + ".pdf") {
                    result.push(file);
                }
            });
        }
    });
    const sql =
        "SELECT idAbsJustifiee, numeroEtudiant, debut, fin, motif, validite, motifValidite,nom, prenom FROM JustificationAbsence, Eleve WHERE JustificationAbsence.numeroEtudiant = Eleve.numero AND idAbsJustifiee = ?";
    db.all(sql, [ID], (err, rows) => {
        if (err) return console.error(err.message);
        rows[0]["list"] = result;

        res.status(200).json(rows[0]);
    });
});

//Récupération de toutes les absences à partir d'un login
router.get("/login/:id", verifyToken, isAdminOrOwner, (req, res) => {
    const sql = "SELECT * FROM JustificationAbsence WHERE login = ?";
    db.all(sql, [login], (err, rows) => {
        if (err) return console.error(err.message);

        res.status(200).json(rows);
    });
});

//Récupération des absences qui correspondent à un filtre
router.get("/filter", verifyToken, isAdmin, (req, res) => {
    let body = req.body;

    let sql =
        "SELECT idAbsJustifiee, numeroEtudiant, debut, fin, motif, validite, nom, prenom FROM JustificationAbsence, Eleve WHERE JustificationAbsence.numeroEtudiant = Eleve.numero ";

    let element = [];
    let start = false;
    let end = false;

    for (let key in body) {
        if (key == "debut") {
            sql += "AND " + key + " >= ? ";
            start = true;
            continue;
        }
        if (key == "fin") {
            sql += "AND " + key + " <= ? ";
            end = true;
            continue;
        }
        sql += "AND " + key + " LIKE '%" + body[key] + "%' ";
    }
    let startV = "";
    let endV = "";
    if (start) {
        let startExplode = body["debut"].split("-");
        startV = startExplode[0] + startExplode[1] + startExplode[2] + "0000";
        element.push(startV);
    }

    if (end) {
        let endExplode = body["fin"].split("-");
        endV = endExplode[0] + endExplode[1] + endExplode[2] + "2323";
        element.push(endV);
    }
    db.all(sql, element, (err, rows) => {
        if (err) return console.error(err.message);

        res.status(200).json(rows);
    });
});

/*****************************************
 *             Méthodes POST
 *****************************************/

//Publication d'une justification
//Publication d'une justification
router.post("/", verifyToken, (req, res) => {
    let body = req.body;
    const userLogin = req.user.pwd.split("-")[0];

    // Security Check: Input Validation
    const validation = validateJustificationInput(body);
    if (!validation.valid) {
        return res.status(400).json(validation.message);
    }

    // Retrieve student number from DB based on login
    db.get("SELECT numero FROM Eleve WHERE loginENT = ?", [userLogin], (err, row) => {
        if (err) return res.status(500).json(err.message);
        if (!row) return res.status(404).json("Étudiant non trouvé");

        let number = row.numero;

        try {
            const formatToDB = (timestamp, withSeconds = false) => {
                const date = new Date(timestamp);
                // Check for invalid date
                if (isNaN(date.getTime())) {
                    throw new Error("Invalid Date");
                }
                const pad = (n) => (n < 10 ? "0" + n : n);
                let str = date.getFullYear().toString() + pad(date.getMonth() + 1) + pad(date.getDate()) + pad(date.getHours()) + pad(date.getMinutes());

                if (withSeconds) {
                    str += pad(date.getSeconds());
                }
                return str;
            };

            let start = formatToDB(body.start);
            let end = formatToDB(body.end);
            let motif = body.justification;
            // Use client provided timestamp or fallback to server time
            let dateDemande = body.timestamp ? formatToDB(body.timestamp, true) : formatToDB(Date.now(), true);

            // On regarde si ya deja des justifications refusées sur cette periode
            const overlapSql = `
                SELECT idAbsJustifiee 
                FROM JustificationAbsence 
                WHERE numeroEtudiant = ? 
                AND validite = 3 
                AND (debut <= ? AND fin >= ?)
            `;

            const insertNewJustification = () => {
                const sql = `INSERT INTO JustificationAbsence (numeroEtudiant, debut, fin, motif, validite, motifValidite, login, dateDemande)
                                          VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

                db.run(sql, [number, start, end, motif, 2, "", userLogin, dateDemande], function (err) {
                    if (err) {
                        console.error(err);
                        return res.status(401).json(err.message);
                    }
                    res.status(200).json(this.lastID);
                });
            };

            db.all(overlapSql, [number, end, start], (err, rows) => {
                if (err) {
                    console.error("Error checking overlaps:", err);
                    return res.status(500).json(err.message);
                }

                if (rows.length > 0) {
                    // Si oui, on supprime les anciennes
                    const idsToDelete = rows.map((r) => r.idAbsJustifiee);
                    const deleteSql = `DELETE FROM JustificationAbsence WHERE idAbsJustifiee IN (${idsToDelete.join(",")})`;

                    db.run(deleteSql, function (err) {
                        if (err) {
                            console.error("Error deleting refused justifications:", err);
                            return res.status(500).json(err.message);
                        }
                        // Et on insère la nouvelle
                        insertNewJustification();
                    });
                } else {
                    // Sinon on cree une nouvelle justification normalement
                    insertNewJustification();
                }
            });
        } catch (e) {
            console.error("Error in POST /justification:", e);
            return res.status(400).json(e.message || "Erreur lors du traitement");
        }
    });
});
/*****************************************
 *           Méthodes UPDATE
 *****************************************/
// Validation d'une justification
router.put("/validate/:id", verifyToken, isAdmin, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let validite = body.value == "validate" ? 0 : body.value == "deny" ? 1 : 3;
    let motifValidite = body.reason;
    if (motifValidite == undefined) {
        motifValidite = "";
    }

    const sql = `UPDATE JustificationAbsence SET validite = ?, motifValidite = ? WHERE idAbsJustifiee = ?`;

    db.run(sql, [validite, motifValidite, id], (err) => {
        if (err) return console.error(err.message);

        if (motifValidite == "") {
            res.status(200).json("Le motif a été validé.");
        } else {
            res.status(200).json("Le motif a été refusé.");
        }
    });
});

//Mise à jour d'une justification

router.put("/:id", verifyToken, (req, res) => {
    let body = req.body;
    let id = req.params.id;

    if (id && id.toString().startsWith("J-")) {
        id = id.substring(2);
    }
    if (!body.justification && !body.start && !body.end) {
        return res.status(400).json("Aucune donnée à mettre à jour");
    }

    const formatToDB = (timestamp, withSeconds = false) => {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return null;
        const pad = (n) => (n < 10 ? "0" + n : n);
        let str = date.getFullYear().toString() + pad(date.getMonth() + 1) + pad(date.getDate()) + pad(date.getHours()) + pad(date.getMinutes());

        if (withSeconds) {
            str += pad(date.getSeconds());
        }
        return str;
    };

    let start = body.start ? formatToDB(body.start) : null;
    let end = body.end ? formatToDB(body.end) : null;
    let motif = body.justification;

    const login = req.user.pwd.split("-")[0];
    const checkSql = "SELECT * FROM JustificationAbsence WHERE login = ? AND idAbsJustifiee = ?";

    db.all(checkSql, [login, id], (err, rows) => {
        if (err) return res.status(500).json(err.message);
        if (rows.length === 0) return res.status(403).json("Non autorisé ou justification introuvable");

        const current = rows[0];

        // Use new values or keep existing ones
        const newStart = start || current.debut;
        const newEnd = end || current.fin;
        const newMotif = motif !== undefined ? motif : current.motif;

        const updateSql = `UPDATE JustificationAbsence SET debut = ?, fin = ?, motif = ?, validite = 2, motifValidite = '' WHERE idAbsJustifiee = ?`;

        db.run(updateSql, [newStart, newEnd, newMotif, id], (err) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json(err.message);
            }
            res.status(200).json("La justification a été mise à jour");
        });
    });
});

/*****************************************
 *           Méthodes DELETE
 *****************************************/
//Suppression justification
router.delete("/:id", verifyToken, (req, res) => {
    let id = req.params.id;
    const checkSql = `
        SELECT JustificationAbsence.validite, Eleve.loginENT
        FROM JustificationAbsence 
        JOIN Eleve ON JustificationAbsence.numeroEtudiant = Eleve.numero 
        WHERE JustificationAbsence.idAbsJustifiee = ?
    `;

    db.get(checkSql, [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err.message);
        }
        if (!row) return res.status(404).json("Justification non trouvée");

        const userRole = req.user.pwd.split("-")[1];
        const userLogin = req.user.pwd.split("-")[0];

        // Check ownership if not admin
        if (userRole !== "admin" && row.loginENT !== userLogin) {
            return res.status(403).json("Vous n'êtes pas autorisé à supprimer cette justification.");
        }

        // Check status (only for students)
        if (userRole !== "admin" && row.validite !== 2) {
            return res.status(403).json("Seules les justifications en attente peuvent être supprimées.");
        }

        // Delete associated files
        const uploadDir = path.join(__dirname, "../upload/justification");
        fs.readdir(uploadDir, (err, files) => {
            if (!err) {
                files.forEach((file) => {
                    if (file.startsWith(`${id}-`)) {
                        try {
                            fs.unlinkSync(path.join(uploadDir, file));
                        } catch (unlinkErr) {
                            console.error(`Error deleting file ${file}:`, unlinkErr);
                        }
                    }
                });
            } else {
                console.error("Error reading upload directory:", err);
            }

            // Delete from DB
            const sql = `DELETE FROM JustificationAbsence WHERE idAbsJustifiee = ?`;
            db.run(sql, [id], (err) => {
                if (err) return console.error(err.message);
                res.status(200).json("La justification a été supprimée avec succès.");
            });
        });
    });
});

module.exports = router;
