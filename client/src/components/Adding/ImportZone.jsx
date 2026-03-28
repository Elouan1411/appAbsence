import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import ExcelJS from "exceljs";
import "../../style/Admin.css";
import toast from "react-hot-toast";
import EditableHeader from "./EditableHeader";
import { API_URL } from "../../config";
import notify from "../../functions/notify";

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
import CustomLoader from "../common/CustomLoader";

function ImportZone({ setRowData, setColDefs, type }) {
    // Configuration based on type
    const isStudent = type === "student";

    const validateData = isStudent ? validateStudentData : validateTeacherData;
    const matchHeader = isStudent ? matchStudentHeader : matchTeacherHeader;
    const expectedHeaders = isStudent ? EXPECTED_STUDENT_HEADERS : EXPECTED_TEACHER_HEADERS;
    const headerDisplayNames = isStudent ? STUDENT_DISPLAY_NAMES : TEACHER_DISPLAY_NAMES;
    const idField = isStudent ? "numero" : "loginENT"; // Key field for duplicate check
    const checkIdEndpoint = isStudent ? `${API_URL}/eleve/allID` : `${API_URL}/teacher/allLoginENT`;

    const [loading, setLoading] = useState(false);

    const processExcel = async (file) => {
        try {
            const existingIds = new Set();
            try {
                setLoading(true);
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
                notify("Impossible de vérifier les doublons en base.", "error");
            } finally {
                setLoading(false);
            }

            // read excel file
            const buffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.worksheets[0];
            const data = [];

            // parsing Header
            const fileHeaders = [];
            const headerRow = worksheet.getRow(1);

            headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                let headerName = cell.value?.toString().trim() || "";

                if (!headerName) {
                    // "No name" logic (same as before)
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

            // construction grid columns
            const gridColumns = [];

            // expected headers
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

            // ignored headers
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

            // parsing rows
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

                // autofill (specific to student or generic if needed)
                rowItem._autoFilled = {};

                // apply autofill for pairs
                ["promo", "groupeTD", "groupeTP"].forEach((field) => {
                    if (rowItem[field] && !rowItem[`${field}Pair`]) {
                        rowItem[`${field}Pair`] = rowItem[field];
                        rowItem._autoFilled[`${field}Pair`] = true;
                    }
                });

                // Validation
                const errors = validateData(rowItem);
                rowItem._errors = errors;

                // Check duplicate DB
                if (rowItem[idField] && existingIds.has(String(rowItem[idField]))) {
                    rowItem._isDuplicate = true;
                }

                data.push(rowItem);
            });

            if (setRowData) setRowData(data);
        } catch (error) {
            console.error("Erreur lecture Excel :", error);
            notify("Impossible de lire le fichier Excel.", "error");
        }
    };

    const onDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) return;

            const extension = file.name.split(".").pop().toLowerCase();
            if (extension !== "xlsx") {
                notify("Seuls les fichiers .xlsx sont acceptés.", "error");
                return;
            }
            processExcel(file);
        },
        [setRowData, setColDefs, type],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    if (loading) return <CustomLoader />;
    return (
        <div {...getRootProps()} className="dropzone-container">
            <input {...getInputProps()} />
            <span className="icon icon-import icon-xxxl import-icon"  title="Importer" />
            {isDragActive ? <p>Déposez le fichier ici...</p> : <p>Glissez-déposez vos fichiers ici...</p>}
        </div>
    );
}

export default ImportZone;
