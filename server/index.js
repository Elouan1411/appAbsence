/*********************************************************
 *                Chargement des modules
 *********************************************************/

const formidable = require("formidable");
const ExcelJS = require("exceljs");

//Lecture de fichiers
const fs = require("fs");
const readline = require("readline");
const path = require("path");

//Importation express : serveur web
var express = require("express");

//Token : serveur web
const jwt = require("jsonwebtoken");

//Cookie parser
const cookieParser = require("cookie-parser");

//Importation dotenv pour les variables d'environnement
require("dotenv").config();

const cors = require("cors");

/*****************************************************
 *             Lancement du serveur web
 *****************************************************/
var app = express();

const PORT = process.env.PORT;
app.listen(PORT, function () {
    console.log("C'est parti ! En attente de connexion sur le port", PORT);
});
// listening to proxy for react routing requests

// Configuration d'express pour utiliser le répertoire "dist" du client
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        // origin: "http://localhost:5173",
        origin: true,
        credentials: true,
    }),
);

/*****************************************************
 *             Constantes utilisées
 *****************************************************/

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Created upload directory at:", uploadDir);
} else {
    console.log("Upload directory exists at:", uploadDir);
}

// Utilisation de la route d'absence
const absenceRoutes = require("./routes/absence");
app.use("/absence", absenceRoutes);

// Utilisation de la route d'authentification
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

//Utilisation de la route appel
const appelRoutes = require("./routes/appel");
app.use("/appel", appelRoutes);

//Utilisation de la route dispense
const dispenseRoutes = require("./routes/dispense");
app.use("/dispense", dispenseRoutes);

//Utilisation de la route file
const fileRoutes = require("./routes/file");
app.use("/file", fileRoutes);

//Utilisation de la route groups
const groupsRoutes = require("./routes/groups");
app.use("/groups", groupsRoutes);

//Utilisation de la route justificatif
const justificatifRoutes = require("./routes/justificatif");
app.use("/justificatif", justificatifRoutes);

//Utilisation de la route justification
const justificationRoutes = require("./routes/justification");
app.use("/justification", justificationRoutes);

//Utilisation de la route RSE
const rseRoutes = require("./routes/rse");
app.use("/rse", rseRoutes);

//Utilisation de la route étudiant
const studentRoutes = require("./routes/student");
app.use("/eleve", studentRoutes);

//Utilisation de la route matière
const subjectRoutes = require("./routes/subject");
app.use("/subject", subjectRoutes);

const teacherRoutes = require("./routes/teacher");
app.use("/teacher", teacherRoutes);

const contactEmailRoutes = require("./routes/contact_email");
app.use("/contact_email", contactEmailRoutes);

app.use("/upload", express.static(path.join(__dirname, "upload")));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});
