const express = require("express");
const { verifyToken, isAdmin, isOwner } = require("../middlewares/auth");
const router = express.Router();

/***************************************
 *            Méthodes GET
 ***************************************/

// Récupération des justificatifs
router.get("/admin/:way", verifyToken, isAdmin, (req, res) => {
    let way = req.params.way.substring(1);
    res.sendFile(__dirname + "/upload/" + way);
});

//Récupération des justifications
router.get("/:way", verifyToken, isOwner, (req, res) => {
    let way = req.params.way.substring(1);
    const sql = "SELECT * FROM JustificationAbsence WHERE login = ? AND idAbsJustifiee = ?";
    const login = decodedToken.pwd.split("-")[0];
    const id = way.split(/[-\.]/)[0];

    db.all(sql, [login, id], (err, rows) => {
        if (err) return console.error(err.message);
        if (rows.length > 0) {
            res.sendFile(__dirname + "/upload/" + way);
        } else res.status(403);
    });
});

/***************************************
 *          Méthodes POST
 ***************************************/

// Publication d'un nouveau justificatif
router.post("/new", verifyToken, isOwner, (req, res) => {
    const sql = "SELECT * FROM JustificationAbsence WHERE login = ? AND idAbsJustifiee = ?";
    const login = decodedToken.pwd.split("-")[0];
    const id = req.body.id;

    db.all(sql, [login, id], (err, rows) => {
        if (err) return console.error(err.message);
        if (rows.length > 0) {
        } else res.status(403);
    });
});

/***************************************
 *          Méthodes DELETE
 ***************************************/

// Suppression d'un justificatif
router.delete("/:way", verifyToken, isOwner, (req, res) => {
    let way = req.params.way.substring(1);

    const sql = "SELECT * FROM JustificationAbsence WHERE login = ? AND idAbsJustifiee = ?";
    const login = decodedToken.pwd.split("-")[0];
    const id = way.split(/[-\.]/)[0];

    db.all(sql, [login, id], (err, rows) => {
        if (err) return console.error(err.message);
        if (rows.length > 0) {
            fs.unlink(__dirname + "/upload/" + way, (err) => {
                if (err) {
                    console.error(errr);
                    res.status(500);
                } else {
                    console.log("Justificatif supprimé avec succés");
                    res.status(200).json("Justificatif supprimé avec succés");
                }
            });
        } else res.status(403);
    });
});
module.exports = router;
