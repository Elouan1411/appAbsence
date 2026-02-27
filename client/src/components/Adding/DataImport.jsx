import React, { useState, useRef, useEffect } from "react";
import Grid from "./Grid";
import {
    HEADER_DISPLAY_NAMES as TEACHER_HEADER_DISPLAY_NAMES,
    EXPECTED_HEADERS as TEACHER_EXPECTED_HEADERS,
    calculateDuplicateRow as calculateTeacherDuplicateRow,
    validateTeacherData,
    matchHeader as teacherMatchHeader,
} from "../../utils/teacherValidation";
import {
    HEADER_DISPLAY_NAMES as STUDENT_HEADER_DISPLAY_NAMES,
    EXPECTED_HEADERS as STUDENT_EXPECTED_HEADERS,
    calculateDuplicateRow as calculateStudentDuplicateRow,
    validateStudentData,
    matchHeader as studentMatchHeader,
} from "../../utils/studentValidation";
import ImportZone from "./ImportZone";
import Button from "../common/Button";
import Separator from "./Separator";
import toast from "react-hot-toast";
import { alertConfirm } from "../../hooks/alertConfirm";
import ExcelJS from "exceljs";
import { API_URL } from "../../config";
import "../../style/icon.css";
import CustomLoader from "../common/CustomLoader";
import notify from "../../functions/notify";

function DataImport({ type, openModal, setHasUnsavedImport }) {
    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([]);
    const [hasErrors, setHasErrors] = useState(false);
    const [hasDuplicate, setHasDuplicate] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const gridRef = useRef(null);

    useEffect(() => {
        setRowData([]);
    }, [type]);

    useEffect(() => {
        setHasUnsavedImport(rowData.length > 0);
    }, [rowData, setHasUnsavedImport]);

    const confirmClose = async () => {
        const result = await alertConfirm("Souhaitez-vous vraiment quitter cette page ?", "Les données ne seront pas sauvegardées.");
        if (result.isConfirmed) {
            setRowData([]);
        }
    };
    const entityLabel = type === "student" ? "étudiant" : "enseignant";
    const containerClass = type === "student" ? "adding-student-container" : "add-teacher-container";
    const contentClass = type === "student" ? "content-container" : "add-teacher-content"; // Assure-toi que ces classes existent dans ton CSS

    const handleInitialDataLoad = async (newRows) => {
        let detectedError = false;
        let detectedDuplicate = false;

        const processedRowsPromises = newRows.map(async (row) => {
            const errors = type === "student" ? validateStudentData(row) : validateTeacherData(row);
            row._errors = errors;

            if (Object.keys(errors).length > 0) {
                detectedError = true;
            }

            try {
                const isDuplicate = type === "student" ? await calculateStudentDuplicateRow(row) : await calculateTeacherDuplicateRow(row);
                row._isDuplicate = isDuplicate;

                if (isDuplicate) {
                    detectedDuplicate = true;
                }
            } catch (error) {
                console.error("Erreur check doublon init", error);
            }

            return row;
        });

        const processedRows = await Promise.all(processedRowsPromises);

        setHasErrors(detectedError);
        setHasDuplicate(detectedDuplicate);
        setRowData(processedRows);
    };

    const handleRename = (colId, newName) => {
        const match = type === "student" ? studentMatchHeader(newName) : teacherMatchHeader(newName);

        if (!match) {
            notify(`Le nom "${newName}" ne correspond à aucune colonne attendue.`, "error");
            return;
        }

        setRowData((currentRows) => {
            return currentRows.map((row) => {
                const newRow = { ...row };
                newRow[match] = newRow[colId];
                delete newRow[colId];
                newRow._errors = type === "student" ? validateStudentData(newRow) : validateTeacherData(newRow);
                return newRow;
            });
        });

        setColDefs((currentCols) => {
            const filtered = currentCols.filter((col) => col.field !== colId);
            return filtered.map((col) => {
                if (col.field === match) {
                    return {
                        ...col,
                        headerName: type === "student" ? STUDENT_HEADER_DISPLAY_NAMES[match] || match : TEACHER_HEADER_DISPLAY_NAMES[match] || match,
                    };
                }
                return col;
            });
        });

        notify(`Super, la colonne est désormais sous le bon nom : "${match}" !`, "success");
    };

    const handleDeleteColumn = (colId) => {
        setColDefs((currentCols) => currentCols.filter((col) => col.field !== colId));
        setRowData((currentRows) => {
            return currentRows.map((row) => {
                const newRow = { ...row };
                delete newRow[colId];
                return newRow;
            });
        });
        notify("Colonne supprimée avec succès.", "success");
    };

    const handleDeleteRow = (rowIndex) => {
        setRowData((currentRows) => currentRows.filter((_, index) => index !== rowIndex));
        notify("Ligne supprimée avec succès.", "success");
    };

    const handleCellValueChanged = async (params) => {
        const updatedData = params.data;

        const errors = type === "student" ? validateStudentData(updatedData) : validateTeacherData(updatedData);
        updatedData._errors = errors;

        try {
            const isDuplicate = type === "student" ? await calculateStudentDuplicateRow(updatedData) : await calculateTeacherDuplicateRow(updatedData);

            updatedData._isDuplicate = isDuplicate;
        } catch (error) {
            console.error("Erreur lors de la vérification du doublon", error);
        }

        params.api.redrawRows({
            rowNodes: [params.node],
            force: true,
        });

        let globalHasError = false;
        let globalHasDuplicate = false;

        params.api.forEachNode((node) => {
            if (node.data._errors && Object.keys(node.data._errors).length > 0) {
                globalHasError = true;
            }
            if (node.data._isDuplicate) {
                globalHasDuplicate = true;
            }
        });

        setHasErrors(globalHasError);
        setHasDuplicate(globalHasDuplicate);
    };

    const handleSaveAndSend = async () => {
        if (!gridRef.current || !gridRef.current.api) {
            notify("La grille n'est pas initialisée", "error");
            return;
        }

        const modifiedRows = [];
        gridRef.current.api.forEachNode((node) => {
            modifiedRows.push(node.data);
        });

        if (modifiedRows.length === 0) {
            notify("Le tableau est vide !", "error");
            return;
        }

        const hasIgnoredCols = colDefs.some((col) => col.field.startsWith("_ignored_"));
        if (hasIgnoredCols) {
            notify("Il y a des colonnes ignorées (grisées) !\nImportation impossible", "error");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(type);

        worksheet.columns = colDefs.map((col) => ({
            header: col.field,
            key: col.field,
        }));

        let hasErrors = false;
        let duplicates = [];

        for (const row of modifiedRows) {
            const length = type === "student" ? Object.keys(validateStudentData(row)).length : Object.keys(validateTeacherData(row)).length;
            const duplicate = type === "student" ? await calculateStudentDuplicateRow(row) : await calculateTeacherDuplicateRow(row);

            if (length > 0) hasErrors = true;
            if (duplicate) duplicates.push(row);
        }

        if (hasErrors) {
            notify("Veuillez corriger les données non-conformes.", "error");
            return;
        }

        if (duplicates.length > 0) {
            let duplicateStr =
                type === "student"
                    ? "Ces numéros étudiant existent déjà dans la base de données :\n"
                    : "Ces identifiants ENT existent déjà dans la base de données :\n";
            for (const duplicate of duplicates) {
                duplicateStr += `- ${type === "student" ? duplicate.numero : duplicate.loginENT}\n`;
            }

            const duplicateConfirmed = await alertConfirm("👥 Êtes-vous surs de vouloir écraser les données ?", duplicateStr);
            if (!duplicateConfirmed.isConfirmed) {
                return;
            }
        }
        worksheet.addRows(modifiedRows);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const fileToSend = new File([blob], "modifications.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        const formData = new FormData();
        formData.append("file", fileToSend);

        if (type === "student") {
            formData.append("promo", "L3");
        }

        const confirmed = await alertConfirm("Êtes-vous surs de vouloir sauvegarder ?", "Vos changements seront irréversibles");

        if (confirmed.isConfirmed) {
            try {
                setLoading(true);
                const response = await fetch(type === "student" ? `${API_URL}/eleve/studentList` : `${API_URL}/teacher/teacherList`, {
                    method: "POST",
                    headers: {},
                    credentials: "include",
                    body: formData,
                });

                if (response.ok) {
                    notify("Données envoyées avec succès.", "success");
                    setHasUnsavedImport(false);
                    setRowData([]);
                } else {
                    notify("Une erreur est survenue.", "error");
                }
            } catch (error) {
                notify("Erreur réseau", error, "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDownloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Modèle d'import");
        const rawHeaders = type === "student" ? STUDENT_EXPECTED_HEADERS : TEACHER_EXPECTED_HEADERS;

        const displayNames = type === "student" ? STUDENT_HEADER_DISPLAY_NAMES : TEACHER_HEADER_DISPLAY_NAMES;

        const columns = rawHeaders.map((key) => ({
            header: displayNames[key] || key,
            key: key,
            width: 20,
        }));

        worksheet.columns = columns;

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `modele_import_${type}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className={containerClass}>
            <div className={contentClass}>
                {rowData.length > 0 ? (
                    <div className="all-import-container">
                        <div className="import-header">
                            <button className="close-import-button" onClick={confirmClose}>
                                <span className="icon-x" />
                            </button>
                        </div>
                        <div className="import-container">
                            <div className="indicator-container">
                                {hasDuplicate && (
                                    <div className="duplicate-container">
                                        <div className="rectangle">
                                            <div className="color-box" />
                                            <p>Lignes dupliquées dans la base de données</p>
                                        </div>
                                    </div>
                                )}

                                {hasErrors && (
                                    <div className="error-container">
                                        <div className="rectangle">
                                            <div className="color-box" />
                                            <p>Cellules non-conformes</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Grid
                                rowData={rowData}
                                colDefs={colDefs}
                                gridRef={gridRef}
                                onRename={handleRename}
                                onDelete={handleDeleteColumn}
                                onDeleteRow={handleDeleteRow}
                                onCellValueChanged={handleCellValueChanged}
                            />
                            <div className="grid-button-container">
                                <Button onClick={handleSaveAndSend} disabled={isLoading}>
                                    {" "}
                                    {isLoading ? <CustomLoader /> : "Sauvegarder"}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="content-import">
                        <ImportZone type={type} setRowData={handleInitialDataLoad} setColDefs={setColDefs} />
                        <div style={{ marginTop: "1rem" }}>
                            <Button onClick={handleDownloadTemplate} className="download-template">
                                <span className="icon-download" style={{ marginRight: "8px" }}></span>
                                Télécharger un modèle
                            </Button>
                        </div>
                        <Separator>ou alors ajoutez un {entityLabel}</Separator>
                        <Button className="add-button" onClick={openModal}>
                            Ajouter
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DataImport;
