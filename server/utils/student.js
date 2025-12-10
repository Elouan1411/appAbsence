const db = require("../database/db");
const exceljs = require("exceljs");

/**
 * Import students from an Excel file into the database (CSV supported)
 * @param {String} filepath - The path to the Excel file.
 * @param {String} fileExtension - The extension of the file (".xlsx" or ".csv").
 * @param {String} promo - The promotion of the students.
 * @returns {Object} { success: boolean, message: string }
 */
async function importExcelInDB(filepath, fileExtension, promo) {
    try {
        const workbook = new exceljs.Workbook();
        if (fileExtension === ".csv") {
            await workbook.csv.readFile(filepath);
        } else {
            await workbook.xlsx.readFile(filepath);
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = exceljs.utils.sheet_to_json(worksheet);

        let processedCount = 0;
        const totalRecords = json.length;

        if (totalRecords === 0) {
            return { success: false, message: "File uploaded but no student records found" };
        }

        for (let i of json) {
            i["promo"] = promo;
            if (i["promoPair"] == undefined) {
                i["promoPair"] = i["promo"];
                i["groupeTDPair"] = i["groupeTD"];
                i["groupeTPPair"] = i["groupeTP"];
            }
            let elements = [];
            for (let j in i) {
                elements.push(i[j]);
            }
            const sql = `INSERT INTO Eleve (numero, loginENT, nom, prenom, Promo, groupeTD, groupeTP, promoPair, groupeTDPair, groupeTPPair)
                                                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            db.run(sql, elements, (err) => {
                processedCount++;

                if (err) {
                    console.error("Error inserting student:", err);
                } else {
                    console.log("Student added successfully.");
                }

                // If all records processed, send response
                if (processedCount === totalRecords) {
                    return { success: true, message: "Students processed and file uploaded successfully" };
                }
            });
        }
    } catch (error) {
        console.error("Error processing Excel file:", error);
        return { success: false, message: "Error processing the Excel file" };
    }
}

module.exports = { importExcelInDB };
