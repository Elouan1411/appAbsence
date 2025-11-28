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

/*****************************************************
 *             Lancement du serveur web
 *****************************************************/
var app = express();

const PORT = process.env.PORT;
app.listen(PORT, function () {
  console.log("C'est parti ! En attente de connexion sur le port", PORT);
});
// listening to proxy for react routing requests

// Configuration d'express pour utiliser le répertoire "public"
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

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
