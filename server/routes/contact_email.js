const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { verifyToken, isAdmin } = require("../middlewares/auth");

const pathEmail = path.join(__dirname, "../database/contact_email.json");

const readEmail = () => {
    try {
        if (!fs.existsSync(pathEmail)) {
            return { contact_email: "" };
        }
        const data = fs.readFileSync(pathEmail, "utf8");
        console.log(data);
        return JSON.parse(data)["contact_email"];
    } catch (err) {
        console.error("Erreur de lecture du fichier:", err);
        return { contact_email: "" };
    }
};

router.get("/", (req, res) => {
    console.log("get contact_email");
    const config = readEmail();
    res.status(200).json(config);
});

router.put("/", verifyToken, isAdmin, (req, res) => {
    const { contact_email } = req.body;

    try {
        const config = { contact_email };
        fs.writeFileSync(pathEmail, JSON.stringify(config, null, 4));
        res.status(200).json({ success: true, contact_email });
    } catch (error) {
        console.error("Erreur d'écriture du fichier:", error);
        res.status(500).json("Erreur d'écriture du fichier");
    }
});

module.exports = router;
