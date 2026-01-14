import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Import } from "lucide-react";
import ExcelJS from "exceljs";
import "../../../style/Admin.css";
import toast from "react-hot-toast";
import { validateTeacherData, matchHeader, EXPECTED_HEADERS, HEADER_DISPLAY_NAMES } from "../../../utils/teacherValidation";
import EditableHeader from "./EditableHeader";

function ImportZone({ setRowData, setColDefs }) {
    const processExcel = async (file) => {
        try {
            // --- ÉTAPE 1 : Récupérer les IDs existants pour détecter les doublons ---
            const existingIds = new Set();
            try {
                // Adapte l'URL selon ton environnement
                const response = await fetch("http://localhost:3000/teacher/allLoginENT", {
                    method: "GET",
                    credentials: "include", // Important pour passer les cookies/sessions
                });

                if (response.ok) {
                    const dbData = await response.json();
                    // dbData = [{ numeroEtudiant: "123456" }, ...]
                    dbData.forEach((row) => {
                        if (row.loginENT) {
                            existingIds.add(String(row.loginENT));
                        }
                    });
                }
                console.log(existingIds);
            } catch (err) {
                console.error("Erreur lors de la récupération des IDs pour doublons", err);
                // On ne bloque pas l'import, mais on avertit
                toast.error("Impossible de vérifier les doublons en base (serveur injoignable ?)");
            }

            // --- ÉTAPE 2 : Lecture du fichier Excel ---
            const buffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.worksheets[0];
            const data = [];

            // check header
            const fileHeaders = [];
            const headerRow = worksheet.getRow(1);

            // parse header and add in fileHeaders
            headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                let headerName = cell.value?.toString().trim() || "";

                if (!headerName) {
                    const column = worksheet.getColumn(colNumber);
                    let hasData = false;
                    column.eachCell((cellData, rowNumber) => {
                        if (rowNumber > 1) {
                            const val = cellData.value;
                            if (val !== null && val !== undefined && val.toString().trim() !== "") {
                                hasData = true;
                            }
                        }
                    });

                    if (!hasData) return;
                    headerName = "Sans nom";
                }

                const mappedKey = headerName === "Sans nom" ? null : matchHeader(headerName);

                fileHeaders.push({
                    name: headerName,
                    index: colNumber,
                    mappedKey: mappedKey,
                });
            });

            const gridColumns = [];

            // on parcourt les headers attendus
            EXPECTED_HEADERS.forEach((expectedKey) => {
                gridColumns.push({
                    field: expectedKey,
                    headerName: HEADER_DISPLAY_NAMES[expectedKey] || expectedKey,
                    cellClassRules: {
                        "cell-error": (params) => {
                            return params.data._errors && params.data._errors[expectedKey];
                        },
                        "cell-autofilled": (params) => {
                            return params.data._autoFilled && params.data._autoFilled[expectedKey];
                        },
                    },
                    tooltipValueGetter: (params) => {
                        if (params.data._autoFilled && params.data._autoFilled[expectedKey]) {
                            return "Valeur remplie automatiquement (copié)";
                        }
                        return undefined;
                    },
                });
            });

            // celles du fichier client qui n'ont pas matché
            fileHeaders.forEach((fh) => {
                if (!fh.mappedKey) {
                    gridColumns.push({
                        field: `_ignored_${fh.name}_${fh.index}`,
                        headerName: fh.name,
                        headerComponent: EditableHeader,
                        cellClass: "cell-ignored",
                        editable: false,
                        tooltipValueGetter: () => "Le nom de la colonne n'est pas reconnu par le système",
                    });
                }
            });

            if (setColDefs) setColDefs(gridColumns);

            // écriture des données dans la grille
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header

                let rowItem = {};

                fileHeaders.forEach((fh) => {
                    const cellValue = row.getCell(fh.index).value;
                    const cleanValue = cellValue && typeof cellValue === "object" && "result" in cellValue ? cellValue.result : cellValue;

                    if (fh.mappedKey) {
                        rowItem[fh.mappedKey] = cleanValue;
                    } else {
                        rowItem[`_ignored_${fh.name}_${fh.index}`] = cleanValue;
                    }
                });

                rowItem._autoFilled = {};

                if (!rowItem.promoPair) {
                    rowItem.promoPair = rowItem.promo;
                    rowItem._autoFilled.promoPair = true;
                }

                if (!rowItem.groupeTDPair) {
                    rowItem.groupeTDPair = rowItem.groupeTD;
                    rowItem._autoFilled.groupeTDPair = true;
                }

                if (!rowItem.groupeTPPair) {
                    rowItem.groupeTPPair = rowItem.groupeTP;
                    rowItem._autoFilled.groupeTPPair = true;
                }

                // validation des données
                const errors = validateTeacherData(rowItem);
                rowItem._errors = errors;

                // --- ÉTAPE 3 : Vérification du doublon BDD ---
                if (rowItem.loginENT && existingIds.has(String(rowItem.loginENT))) {
                    rowItem._isDuplicate = true; // Flag pour le style CSS
                }

                data.push(rowItem);
            });

            if (setRowData) setRowData(data);
            console.log(`${data.length} lignes importées localement.`);
        } catch (error) {
            console.error("Erreur lors de la lecture du fichier Excel :", error);
            toast.error("Impossible de lire le fichier Excel.");
        }
    };

    const onDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) return;

            const extension = file.name.split(".").pop().toLowerCase();
            if (extension !== "xlsx" && extension !== "csv") {
                toast.error("Extension de fichier invalide.");
                return;
            }

            if (extension === "xlsx") {
                processExcel(file);
            }
        },
        [setRowData, setColDefs]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    return (
        <div {...getRootProps()} className="dropzone-container">
            <input {...getInputProps()} />
            <Import size={40} className="import-icon" />
            {isDragActive ? <p>Déposez le fichier ici...</p> : <p>Glissez-déposez vos fichiers ici...</p>}
        </div>
    );
}

export default ImportZone;
