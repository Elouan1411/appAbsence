/*********************************************************
 *                Module loading
 *********************************************************/

const formidable = require("formidable");
const ExcelJS = require("exceljs");

// File reading
const fs = require("fs");
const readline = require("readline");
const path = require("path");

// Express import: web server
var express = require("express");

// Token: web server
const jwt = require("jsonwebtoken");

// Cookie parser
const cookieParser = require("cookie-parser");

// Dotenv import for environment variables
require("dotenv").config();

const cors = require("cors");

/*****************************************************
 *             Starting the web server
 *****************************************************/
var app = express();

const PORT = parseInt(process.env.PORT || "3000", 10);

if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET involves is not defined in .env");
    process.exit(1);
}

if (!process.env.CORS_ORIGIN) {
    console.error("FATAL ERROR: CORS_ORIGIN is not defined in .env");
    process.exit(1);
}

app.listen(PORT, "0.0.0.0", function () {
    console.log("C'est parti ! En attente de connexion sur le port", PORT);
});
// listening to proxy for react routing requests

// Express configuration to use the client's "dist" directory
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.CORS_ORIGIN.split(","),
        credentials: true,
    }),
);

/*****************************************************
 *             Constants used
 *****************************************************/

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Ensure student-list directory exists
const studentListDir = path.join(uploadDir, "student-list");
if (!fs.existsSync(studentListDir)) {
    fs.mkdirSync(studentListDir, { recursive: true });
}
// Ensure justification directory exists
const justificationDir = path.join(uploadDir, "justification");
if (!fs.existsSync(justificationDir)) {
    fs.mkdirSync(justificationDir, { recursive: true });
}

// Using absence route
const absenceRoutes = require("./routes/absence");
app.use("/absence", absenceRoutes);

// Using authentication route
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Using call route
const appelRoutes = require("./routes/appel");
app.use("/appel", appelRoutes);

// Using exemption route
const dispenseRoutes = require("./routes/dispense");
app.use("/dispense", dispenseRoutes);

// Using file route
const fileRoutes = require("./routes/file");
app.use("/file", fileRoutes);

// Using groups route
const groupsRoutes = require("./routes/groups");
app.use("/groups", groupsRoutes);

// Using justification document route
const justificatifRoutes = require("./routes/justificatif");
app.use("/justificatif", justificatifRoutes);

// Using justification route
const justificationRoutes = require("./routes/justification");
app.use("/justification", justificationRoutes);

// Using CSR route
const rseRoutes = require("./routes/rse");
app.use("/rse", rseRoutes);

// Using student route
const studentRoutes = require("./routes/student");
app.use("/eleve", studentRoutes);

// Using subject route
const subjectRoutes = require("./routes/subject");
app.use("/subject", subjectRoutes);

const teacherRoutes = require("./routes/teacher");
app.use("/teacher", teacherRoutes);

const contactEmailRoutes = require("./routes/contact_email");
app.use("/contact_email", contactEmailRoutes);

const databaseRoutes = require("./routes/database");
app.use("/database", databaseRoutes);

app.use("/upload", express.static(path.join(__dirname, "upload")));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});
