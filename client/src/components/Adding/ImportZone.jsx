import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
// import { Import } from "lucide-react";
import ExcelJS from "exceljs";
import "../../style/Admin.css";
import toast from "react-hot-toast";
import EditableHeader from "./EditableHeader";
import { API_URL } from "../../config";

// Import Student Utils
import {
    validateStudentData,
    matchHeader as matchStudentHeader,
    EXPECTED_HEADERS as EXPECTED_STUDENT_HEADERS,
    HEADER_DISPLAY_NAMES as STUDENT_DISPLAY_NAMES,
} from "../../utils/studentValidation";

// Import Teacher Utils
import {
    validateTeacherData,
    matchHeader as matchTeacherHeader,
    EXPECTED_HEADERS as EXPECTED_TEACHER_HEADERS,
    HEADER_DISPLAY_NAMES as TEACHER_DISPLAY_NAMES,
} from "../../utils/teacherValidation";

function ImportZone({ setRowData, setColDefs, type }) {
    // Configuration selon le type
    const isStudent = type === "student";

    const validateData = isStudent ? validateStudentData : validateTeacherData;
    const matchHeader = isStudent ? matchStudentHeader : matchTeacherHeader;
    const expectedHeaders = isStudent ? EXPECTED_STUDENT_HEADERS : EXPECTED_TEACHER_HEADERS;
    const headerDisplayNames = isStudent ? STUDENT_DISPLAY_NAMES : TEACHER_DISPLAY_NAMES;
    const idField = isStudent ? "numero" : "loginENT"; // Champ clé pour check doublon
    const checkIdEndpoint = isStudent ? `${API_URL}/eleve/allID` : `${API_URL}/teacher/allLoginENT`;

    const processExcel = async (file) => {
        try {
            // --- ÉTAPE 1 : Check doublons ---
            const existingIds = new Set();
            try {
                const response = await fetch(checkIdEndpoint, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const dbData = await response.json();
                    dbData.forEach((row) => {
                        if (row[idField]) {
                            existingIds.add(String(row[idField]));
                        }
                    });
                }
            } catch (err) {
                console.error("Erreur check doublons", err);
                toast.error("Impossible de vérifier les doublons en base.");
            }

            // --- ÉTAPE 2 : Lecture Excel ---
            const buffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.worksheets[0];
            const data = [];

            // Parsing Header
            const fileHeaders = [];
            const headerRow = worksheet.getRow(1);

            headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                let headerName = cell.value?.toString().trim() || "";

                if (!headerName) {
                    // Logique "Sans nom" (identique à avant)
                    const column = worksheet.getColumn(colNumber);
                    let hasData = false;
                    column.eachCell((cellData, rowNumber) => {
                        if (rowNumber > 1 && cellData.value) hasData = true;
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

            // Construction colonnes Grid
            const gridColumns = [];

            // Colonnes attendues
            expectedHeaders.forEach((expectedKey) => {
                gridColumns.push({
                    field: expectedKey,
                    headerName: headerDisplayNames[expectedKey] || expectedKey,
                    cellClassRules: {
                        "cell-error": (params) => params.data._errors && params.data._errors[expectedKey],
                        "cell-autofilled": (params) => params.data._autoFilled && params.data._autoFilled[expectedKey],
                    },
                    tooltipValueGetter: (params) => {
                        if (params.data._autoFilled && params.data._autoFilled[expectedKey]) {
                            return "Valeur remplie automatiquement (copié)";
                        }
                        return undefined;
                    },
                });
            });

            // Colonnes ignorées
            fileHeaders.forEach((fh) => {
                if (!fh.mappedKey) {
                    gridColumns.push({
                        field: `_ignored_${fh.name}_${fh.index}`,
                        headerName: fh.name,
                        headerComponent: EditableHeader,
                        cellClass: "cell-ignored",
                        editable: false,
                        tooltipValueGetter: () => "Le nom de la colonne n'est pas reconnu",
                    });
                }
            });

            if (setColDefs) setColDefs(gridColumns);

            // Parsing des lignes
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

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

                // Autofill (Spécifique étudiant ou générique si besoin)
                rowItem._autoFilled = {};

                // On applique l'autofill pour les paires (fonctionne pour les 2 si les champs existent)
                ["promo", "groupeTD", "groupeTP"].forEach((field) => {
                    if (rowItem[field] && !rowItem[`${field}Pair`]) {
                        rowItem[`${field}Pair`] = rowItem[field];
                        rowItem._autoFilled[`${field}Pair`] = true;
                    }
                });

                // Validation
                const errors = validateData(rowItem);
                rowItem._errors = errors;

                // Check doublon BDD
                if (rowItem[idField] && existingIds.has(String(rowItem[idField]))) {
                    rowItem._isDuplicate = true;
                }

                data.push(rowItem);
            });

            if (setRowData) setRowData(data);
        } catch (error) {
            console.error("Erreur lecture Excel :", error);
            toast.error("Impossible de lire le fichier Excel.");
        }
    };

    const onDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) return;

            const extension = file.name.split(".").pop().toLowerCase();
            if (extension !== "xlsx") {
                toast.error("Seuls les fichiers .xlsx sont acceptés.");
                return;
            }
            processExcel(file);
        },
        [setRowData, setColDefs, type],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div {...getRootProps()} className="dropzone-container">
            <input {...getInputProps()} />
            {/* <Import size={40} className="import-icon" /> */}
            <span className="icon icon-import icon-xxxl import-icon" />
            {isDragActive ? <p>Déposez le fichier ici...</p> : <p>Glissez-déposez vos fichiers ici...</p>}
        </div>
    );
}

export default ImportZone;
