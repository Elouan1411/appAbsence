
const fs = require("fs");
const path = require("path");




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

module.exports = { readEmail };