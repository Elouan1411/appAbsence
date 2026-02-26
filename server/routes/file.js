const express = require("express");
const router = express.Router();
const fs = require("fs");
const formidable = require("formidable");
const path = require("path");
const PDFDocument = require("pdfkit");
const { verifyToken, isAdmin } = require("../middlewares/auth");
const db = require("../database/db");

/*****************************************
 *            Méthodes POST
 *****************************************/

// Helper to check extensions
const ALLOWED_EXTENSIONS = {
    images: [".jpg", ".jpeg", ".png"],
    docs: [".pdf"],
};

/**
 * Convert image file to PDF and save it
 * @param {string} imagePath - Path to the temporary image file
 * @param {string} destPath - Destination path for the PDF
 */
const convertImageToPdf = (imagePath, destPath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(destPath);

        doc.pipe(stream);

        // Add image to PDF (fit to page)
        doc.image(imagePath, 0, 0, {
            fit: [doc.page.width, doc.page.height],
            align: "center",
            valign: "center",
        });

        doc.end();

        stream.on("finish", () => resolve(destPath));
        stream.on("error", (err) => reject(err));
    });
};

router.post("/upload", (req, res) => {
    const uploadDir = path.join(__dirname, "../upload/justification");

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new formidable.IncomingForm({
        uploadDir: uploadDir,
        keepExtensions: true,
        allowEmptyFiles: false,
        maxFileSize: 100 * 1024 * 1024, // 100MB limit to prevent server overload
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Form parsing error", err);
            return res.status(500).json({ error: "File upload error" });
        }

        const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
        let customName = Array.isArray(fields.fileName) ? fields.fileName[0] : fields.fileName;

        if (!uploadedFile) {
            return res.status(400).json({ error: "No file provided" });
        }

        if (!customName) {
            customName = path.parse(uploadedFile.originalFilename).name;
        }

        // Remove any non-alphanumeric characters
        customName = customName.replace(/[^a-zA-Z0-9_-]/g, "");

        // Check file limit (max 10)
        const MAX_NB_FILES = 10;
        const justificationId = customName.split("-")[0];
        if (justificationId) {
            try {
                const existingFiles = fs.readdirSync(uploadDir).filter((f) => f.startsWith(`${justificationId}-`));
                if (existingFiles.length >= MAX_NB_FILES) {
                    if (fs.existsSync(uploadedFile.filepath)) {
                        fs.unlinkSync(uploadedFile.filepath);
                    }
                    return res.status(400).json({ error: `Limite de ${MAX_NB_FILES} fichiers atteinte pour cette justification.` });
                }
            } catch (err) {
                console.error("Error checking file limit:", err);
            }
        }

        const ext = path.extname(uploadedFile.originalFilename).toLowerCase();

        try {
            if (ALLOWED_EXTENSIONS.images.includes(ext)) {
                const imagePathToConvert = uploadedFile.filepath;

                // Convert to PDF
                const finalPath = path.join(uploadDir, `${customName}.pdf`);
                await convertImageToPdf(imagePathToConvert, finalPath);

                // Remove the temp uploaded image file (original)
                if (fs.existsSync(uploadedFile.filepath)) {
                    fs.unlinkSync(uploadedFile.filepath);
                }

                return res.status(200).json({ message: "File uploaded and converted to PDF", fileName: `${customName}.pdf` });
            } else if (ALLOWED_EXTENSIONS.docs.includes(ext)) {
                if (ext === ".pdf") {
                    // Just rename if it's already PDF
                    const finalPath = path.join(uploadDir, `${customName}.pdf`);
                    fs.renameSync(uploadedFile.filepath, finalPath);
                    return res.status(200).json({ message: "File uploaded", fileName: `${customName}.pdf` });
                } else {
                    // Fallback for txt or others if kept
                    const finalPath = path.join(uploadDir, `${customName}${ext}`);
                    fs.renameSync(uploadedFile.filepath, finalPath);
                    return res.status(200).json({ message: "File uploaded", fileName: `${customName}${ext}` });
                }
            } else {
                // Delete temp file
                fs.unlinkSync(uploadedFile.filepath);
                return res.status(400).json({ error: "File type not allowed" });
            }
        } catch (error) {
            console.error("Processing error", error);
            // Cleanup temp file if exists
            if (fs.existsSync(uploadedFile.filepath)) {
                fs.unlinkSync(uploadedFile.filepath);
            }
            return res.status(500).json({ error: "Error processing file" });
        }
    });
});

/*****************************************
 *           Méthodes DELETE
 *****************************************/

const archiver = require("archiver");
router.get("/years", verifyToken, isAdmin, (req, res) => {
    const uploadDir = path.join(__dirname, "../upload/justification");

    if (!fs.existsSync(uploadDir)) {
        return res.json({ totalSize: 0, years: [] });
    }

    try {
        const files = fs.readdirSync(uploadDir);
        let totalSize = 0;
        const yearsMap = {};

        files.forEach((file) => {
            const filePath = path.join(uploadDir, file);
            let stats;
            try {
                stats = fs.statSync(filePath);
            } catch (e) {
                return;
            }

            totalSize += stats.size;
            const dateMatch = file.match(/-(\d{12,})\./) || file.match(/-(\d{12,})$/);

            if (dateMatch) {
                const dateStr = dateMatch[1];
                const year = parseInt(dateStr.substring(0, 4), 10);
                const month = parseInt(dateStr.substring(4, 6), 10);

                let academicYear = year;
                if (month < 9) {
                    academicYear = year - 1;
                }

                if (!yearsMap[academicYear]) {
                    yearsMap[academicYear] = 0;
                }
                yearsMap[academicYear] += stats.size;
            }
        });

        const yearsArray = Object.keys(yearsMap)
            .map((y) => ({ year: parseInt(y), size: yearsMap[y] }))
            .sort((a, b) => b.year - a.year);

        res.json({
            totalSize: totalSize,
            years: yearsArray,
        });
    } catch (err) {
        console.error("Error scanning justification directory:", err);
        res.status(500).json({ error: "Server error scanning files" });
    }
});

router.get("/download-all", verifyToken, isAdmin, (req, res) => {
    const uploadDir = path.join(__dirname, "../upload/justification");

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="all_justifications_${Date.now()}.zip"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(uploadDir, false);
    archive.finalize();
});

router.get("/download-year/:year", verifyToken, isAdmin, (req, res) => {
    const year = parseInt(req.params.year);
    if (!year) return res.status(400).json({ error: "Invalid year" });

    const uploadDir = path.join(__dirname, "../upload/justification");
    if (!fs.existsSync(uploadDir)) return res.status(404).send("No files directory");

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="justifications_${year}_${year + 1}.zip"`);

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", function (err) {
        res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    fs.readdirSync(uploadDir).forEach((file) => {
        const dateMatch = file.match(/-(\d{12,})\./) || file.match(/-(\d{12,})$/);

        if (dateMatch) {
            const dateStr = dateMatch[1];
            const fileYear = parseInt(dateStr.substring(0, 4), 10);
            const fileMonth = parseInt(dateStr.substring(4, 6), 10);

            let academicYear = fileYear;
            if (fileMonth < 9) {
                academicYear = fileYear - 1;
            }

            if (academicYear === year) {
                archive.file(path.join(uploadDir, file), { name: file });
            }
        }
    });

    archive.finalize();
});

router.delete("/delete-all", verifyToken, isAdmin, (req, res) => {
    const uploadDir = path.join(__dirname, "../upload/justification");
    let deletedCount = 0;

    try {
        if (fs.existsSync(uploadDir)) {
            const files = fs.readdirSync(uploadDir);
            files.forEach((file) => {
                try {
                    const filePath = path.join(uploadDir, file);
                    if (fs.lstatSync(filePath).isFile()) {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                    }
                } catch (e) {
                    console.error(`Error deleting file ${file}:`, e);
                }
            });
        }
        res.status(200).json({ message: `${deletedCount} fichiers supprimés avec succès.` });
    } catch (error) {
        console.error("Error regarding delete-all:", error);
        res.status(500).json({ error: "Erreur lors de la suppression des fichiers." });
    }
});

router.delete("/:name", verifyToken, (req, res) => {
    const filename = req.params.name;
    const uploadDir = path.join(__dirname, "../upload/justification");
    const filepath = path.join(uploadDir, filename);

    // Basic security
    if (filename.includes("..") || filename.includes("/")) {
        return res.status(400).json({ error: "Invalid filename" });
    }

    const parts = filename.split("-");
    const justificationId = parts[0];
    // filename format: id-docN-timestamp

    if (!justificationId) {
        return res.status(400).json({ error: "Invalid filename format" });
    }

    const userLogin = req.user.pwd.split("-")[0];
    const userRole = req.user.pwd.split("-")[1];

    const proceedToDelete = () => {
        if (fs.existsSync(filepath)) {
            try {
                fs.unlinkSync(filepath);
                res.status(200).json({ message: "Fichier supprimé avec succès." });
            } catch (e) {
                console.error("Error deleting file:", e);
                res.status(500).json({ error: "Erreur lors de la suppression du fichier." });
            }
        } else {
            res.status(200).json({ message: "Fichier introuvable (probablement déjà supprimé)." });
        }
    };

    if (userRole === "admin") {
        proceedToDelete();
    } else {
        // Check ownership
        db.get("SELECT login FROM JustificationAbsence WHERE idAbsJustifiee = ?", [justificationId], (err, row) => {
            if (err) return res.status(500).json({ error: "Database error" });
            if (!row) return res.status(404).json({ error: "Justification not found" });

            if (row.login === userLogin) {
                proceedToDelete();
            } else {
                res.status(403).json({ error: "Unauthorized to delete this file" });
            }
        });
    }
});

router.delete("/delete-year/:year", verifyToken, isAdmin, (req, res) => {
    const year = parseInt(req.params.year);
    if (!year) return res.status(400).json({ error: "Invalid year" });

    const uploadDir = path.join(__dirname, "../upload/justification");
    let deletedCount = 0;

    if (fs.existsSync(uploadDir)) {
        fs.readdirSync(uploadDir).forEach((file) => {
            const dateMatch = file.match(/-(\d{12,})\./) || file.match(/-(\d{12,})$/);

            if (dateMatch) {
                const dateStr = dateMatch[1];
                const fileYear = parseInt(dateStr.substring(0, 4), 10);
                const fileMonth = parseInt(dateStr.substring(4, 6), 10);

                let academicYear = fileYear;
                if (fileMonth < 9) {
                    academicYear = fileYear - 1;
                }

                if (academicYear === year) {
                    try {
                        fs.unlinkSync(path.join(uploadDir, file));
                        deletedCount++;
                    } catch (e) {
                        console.error("Error deleting file:", e);
                    }
                }
            }
        });
    }

    res.status(200).json({ message: `${deletedCount} fichiers supprimés pour l'année ${year}-${year + 1}.` });
});

module.exports = router;
