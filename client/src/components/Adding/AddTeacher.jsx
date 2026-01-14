import React from "react";
import { useState } from "react";
import ImportZone from "./AddStudents/ImportZoneTeacher";
import PageTitle from "../common/PageTitle";
import Button from "../common/Button";
import Separator from "./Separator";
import { useRef } from "react";
import { matchHeader, validateTeacherData, HEADER_DISPLAY_NAMES, calculateDuplicateRow } from "../../utils/teacherValidation";
import Grid from "./AddStudents/Grid";
import toast from "react-hot-toast";
import { alertConfirm } from "../../hooks/alertConfirm";
import ExcelJS from "exceljs";

function AddTeacherPage({ openModal }) {
    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([]);
    const [hasErrors, setHasErrors] = useState(false);
    const [hasDuplicate, setHasDuplicate] = useState(false);

    const gridRef = useRef(null);

    const handleInitialDataLoad = async (newRows) => {
        let detectedError = false;
        let detectedDuplicate = false;

        const processedRowsPromises = newRows.map(async (row) => {
            const errors = validateTeacherData(row);
            row._errors = errors;

            if (Object.keys(errors).length > 0) {
                detectedError = true;
            }

            try {
                const isDuplicate = await calculateDuplicateRow(row);
                row._isDuplicate = isDuplicate; // On attache le flag doublon

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
        const match = matchHeader(newName);

        if (!match) {
            toast.error(`Le nom "${newName}" ne correspond à aucune colonne attendue.`);
            return;
        }

        // remapper les données
        setRowData((currentRows) => {
            return currentRows.map((row) => {
                const newRow = { ...row };
                newRow[match] = newRow[colId];
                // on supprime la clé avec _ignored_ devant
                delete newRow[colId];

                // re-valider la ligne
                newRow._errors = validateTeacherData(newRow);
                return newRow;
            });
        });

        // on met à jour la colonne cible avec le bon nom d'affichage
        setColDefs((currentCols) => {
            // 1. On retire la colonne ignorée
            const filtered = currentCols.filter((col) => col.field !== colId);

            // 2. On met à jour le headerName de la colonne qui vient d'être peuplée
            return filtered.map((col) => {
                if (col.field === match) {
                    return {
                        ...col,
                        headerName: HEADER_DISPLAY_NAMES[match] || match,
                    };
                }
                return col;
            });
        });

        toast.success(`Super, la colonne est désormais sous le bon nom : "${match}" !`);
    };

    const handleDeleteColumn = (colId) => {
        // on retire la colonne de la definitions des colonnes
        setColDefs((currentCols) => currentCols.filter((col) => col.field !== colId));

        setRowData((currentRows) => {
            return currentRows.map((row) => {
                const newRow = { ...row };
                delete newRow[colId];
                return newRow;
            });
        });
        toast.success("Colonne supprimée avec succès.");
    };

    const handleDeleteRow = (rowIndex) => {
        setRowData((currentRows) => currentRows.filter((_, index) => index !== rowIndex));
        toast.success("Ligne supprimée avec succès.");
    };

    const handleCellValueChanged = async (params) => {
        setHasDuplicate(false);
        setHasErrors(false);
        // params.data contient la ligne modifiée
        const updatedData = params.data;

        // On recalcule les erreurs pour cette ligne
        const errors = validateTeacherData(updatedData);

        // On met à jour l'objet _errors
        updatedData._errors = errors;
        if (Object.keys(updatedData._errors).length > 0) {
            setHasErrors(true);
        }

        try {
            const isDuplicate = await calculateDuplicateRow(updatedData);
            if (isDuplicate) {
                setHasDuplicate(true);
            }
            updatedData._isDuplicate = isDuplicate;
        } catch (error) {
            console.error("Erreur lors de la vérification du doublon", error);
        }

        // On force le rafraichissement de la ligne pour appliquer les styles (rouge/pas rouge)
        params.api.redrawRows({
            rowNodes: [params.node],
            force: true,
        });
    };
    const handleSaveAndSend = async () => {
        if (!gridRef.current || !gridRef.current.api) {
            toast.error("La grille n'est pas initialisée");
            return;
        }

        const modifiedRows = [];
        gridRef.current.api.forEachNode((node) => {
            modifiedRows.push(node.data);
        });

        if (modifiedRows.length === 0) {
            toast.error("Le tableau est vide !");
            return;
        }

        const hasIgnoredCols = colDefs.some((col) => col.field.startsWith("_ignored_"));
        if (hasIgnoredCols) {
            toast.error("Il y a des colonnes ignorées (grisées) !\nImportation impossible");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Teachers");

        worksheet.columns = colDefs.map((col) => ({
            header: col.field,
            key: col.field,
        }));

        let hasErrors = false;
        let duplicates = [];

        for (const row of modifiedRows) {
            const length = Object.keys(validateTeacherData(row)).length;
            const duplicate = await calculateDuplicateRow(row);
            if (length > 0) {
                hasErrors = true;
            }
            if (duplicate) {
                duplicates.push(row);
            }
        }
        if (hasErrors) {
            toast.error("Veuillez corriger les données non-conformes.");
            return;
        }

        if (duplicates.length > 0) {
            let duplicateStr = "Ces numéros étudiant existent déjà dans la base de données :\n";
            for (const duplicate of duplicates) {
                duplicateStr += `- ${duplicate.loginENT}\n`;
            }

            const duplicateConfirmed = await alertConfirm("👥 Êtes-vous surs de vouloir écraser les données ?", duplicateStr);
            if (!duplicateConfirmed.isConfirmed) {
                return;
            }
        }
        worksheet.addRows(modifiedRows);

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const fileToSend = new File([blob], "modifications.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const formData = new FormData();
        formData.append("file", fileToSend);

        const result = await alertConfirm("Êtes-vous surs de vouloir sauvegarder ?");

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:3000/teacher/teacherList`, {
                    method: "POST",
                    headers: {},
                    credentials: "include",
                    body: formData,
                });

                const values = await response.json();
                if (response.ok) {
                    toast.success("Données envoyées avec succès.");
                } else {
                    toast.error("Une erreur est survenue.");
                }
            } catch (error) {
                toast.error("Erreur réseau", error);
            }
        }
    };
    return (
        <div className="add-teacher-container">
            <div className="add-teacher-content">
                {rowData.length > 0 ? (
                    <div style={{ marginTop: 20, width: "100%" }}>
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
                            gridRef={gridRef} // On passe la ref ici
                            onRename={handleRename} // On passe la fonction de renommage
                            onDelete={handleDeleteColumn} // On passe la fonction de suppression
                            onDeleteRow={handleDeleteRow} // On passe la fonction de suppression de ligne
                            onCellValueChanged={handleCellValueChanged} // Recalcul des erreurs à l'édition
                        />
                        <div className="grid-button-container" style={{}}>
                            <Button onClick={handleSaveAndSend}>Sauvegarder</Button>
                        </div>
                    </div>
                ) : (
                    <div className="content-import">
                        <ImportZone setRowData={handleInitialDataLoad} setColDefs={setColDefs} />
                        <Separator>ou alors ajoutez un professeur</Separator>
                        <Button className="add-button" onClick={openModal}>
                            Ajouter
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddTeacherPage;
