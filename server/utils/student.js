const db = require("../database/db");
const exceljs = require("exceljs");
const fs = require("fs");
const path = require("path");

/**
 * Import students from an Excel file into the database (CSV supported)
 * @param {String} filepath - The path to the Excel file.
 * @param {String} fileExtension - The extension of the file (".xlsx" or ".csv").
 * @param {String} promo - The promotion of the students.
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
function importExcelInDB(filepath, fileExtension, promo) {
    return new Promise(async (resolve, reject) => {
        console.log(`[DEBUG] importExcelInDB started for file: ${filepath}, ext: ${fileExtension}, promo: ${promo}`);

        //TEMP
        //TELECHARGER SUR MON ORDI LE FICHIER :

        const debugDir = path.join(__dirname, "../../debug"); // Adjust path depending on where your server root is
        // Or simply use relative path if running from root:
        if (!fs.existsSync("./debug")) {
            fs.mkdirSync("./debug");
        }

        fs.copyFileSync(filepath, `./debug/debug_import${fileExtension}`);
        // FIN TEMP

        try {
            const workbook = new exceljs.Workbook();
            if (fileExtension === ".csv") {
                console.log("[DEBUG] Reading CSV...");
                await workbook.csv.readFile(filepath);
            } else {
                console.log("[DEBUG] Reading XLSX...");
                await workbook.xlsx.readFile(filepath);
            }
            console.log("[DEBUG] File read complete.");

            const worksheet = workbook.getWorksheet(1);

            if (!worksheet) {
                console.log("[DEBUG] No worksheet found.");
                resolve({ success: false, message: "File uploaded but no worksheet found" });
                return;
            }

            const totalRows = worksheet.rowCount;
            console.log(`[DEBUG] Worksheet found. Total rows: ${totalRows}`);

            if (totalRows <= 1) {
                // Assuming row 1 is header
                console.log("[DEBUG] Not enough rows (<= 1).");
                resolve({ success: false, message: "File uploaded but no student records found" });
                return;
            }

            console.log("[DEBUG] Preparing BULK INSERT...");

            const outputData = [];
            const placeholders = [];

            // Iterate rows to build data
            // Start at 2 to skip header
            for (let rowNumber = 2; rowNumber <= totalRows; rowNumber++) {
                const row = worksheet.getRow(rowNumber);

                const numero = row.getCell(1).value;
                const login = row.getCell(2).value;
                const nom = row.getCell(3).value;
                const prenom = row.getCell(4).value;
                const promo = row.getCell(5).value;
                const groupeTD = row.getCell(6).value;
                const groupeTP = row.getCell(7).value;
                const promoPair = row.getCell(8).value;
                const groupeTDPair = row.getCell(9).value;
                const groupeTPPair = row.getCell(10).value;

                outputData.push(numero, login, nom, prenom, promo, groupeTD, groupeTP, promoPair, groupeTDPair, groupeTPPair);

                placeholders.push("(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            }

            if (outputData.length === 0) {
                resolve({ success: false, message: "No valid students found in file." });
                return;
            }

            const sql =
                `INSERT OR REPLACE INTO Eleve (numero, loginENT, nom, prenom, Promo, groupeTD, groupeTP, promoPair, groupeTDPair, groupeTPPair) VALUES ` +
                placeholders.join(", ");

            console.log(`[DEBUG] Executing Bulk Insert for ${placeholders.length} records...`);

            db.run(sql, outputData, (err) => {
                if (err) {
                    console.error("[DEBUG] Error during Bulk Insert:", err.message);
                    resolve({ success: false, message: "Error during bulk insertion: " + err.message });
                } else {
                    console.log("[DEBUG] Bulk insert successful.");
                    resolve({ success: true, message: `Successfully imported ${placeholders.length} students.` });
                }
            });
        } catch (error) {
            console.error("[DEBUG] Catch error:", error);
            resolve({ success: false, message: "Error processing the Excel file: " + error.message });
        }
    });
}

module.exports = { importExcelInDB };
