const express = require("express");
const router = express.Router();
const fs = require("fs");
const formidable = require("formidable");
const path = require("path");
const PDFDocument = require("pdfkit");
const heicConvert = require("heic-convert");

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
    const uploadDir = path.join(__dirname, "../upload");

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new formidable.IncomingForm({
        uploadDir: uploadDir,
        keepExtensions: true,
        allowEmptyFiles: false,
        maxFileSize: 50 * 1024 * 1024, // 50MB
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

module.exports = router;
