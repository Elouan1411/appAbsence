const express = require("express");
const router = express.Router();
const fs = require("fs");
const formidable = require("formidable");
const path = require("path");
const PDFDocument = require("pdfkit");
const heicConvert = require("heic-convert");
const { verifyToken } = require("../middlewares/auth");
const db = require("../database/db");

/*****************************************
 *            Méthodes POST
 *****************************************/

// Helper to check extensions
const ALLOWED_EXTENSIONS = {
    images: [".jpg", ".jpeg", ".png", ".heic", ".heif"],
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
                let imagePathToConvert = uploadedFile.filepath;
                let tempJpegPath = null;

                if (ext === ".heic" || ext === ".heif") {
                    const inputBuffer = fs.readFileSync(uploadedFile.filepath);
                    const outputBuffer = await heicConvert({
                        buffer: inputBuffer,
                        format: "JPEG",
                        quality: 1,
                    });

                    tempJpegPath = path.join(uploadDir, `temp-${Date.now()}.jpg`);
                    fs.writeFileSync(tempJpegPath, Buffer.from(outputBuffer));
                    imagePathToConvert = tempJpegPath;
                }

                // Convert to PDF
                const finalPath = path.join(uploadDir, `${customName}.pdf`);
                await convertImageToPdf(imagePathToConvert, finalPath);

                // Remove the temp uploaded image file (original)
                if (fs.existsSync(uploadedFile.filepath)) {
                    fs.unlinkSync(uploadedFile.filepath);
                }

                // Remove intermediate jpeg if it was created
                if (tempJpegPath && fs.existsSync(tempJpegPath)) {
                    fs.unlinkSync(tempJpegPath);
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
                res.status(200).json({ message: "File deleted" });
            } catch (e) {
                console.error("Error deleting file:", e);
                res.status(500).json({ error: "Error deleting file" });
            }
        } else {
            res.status(200).json({ message: "File not found but considered deleted" });
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

module.exports = router;
