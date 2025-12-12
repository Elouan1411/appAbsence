import React, { useState, useRef } from "react";
import ImportZone from "../../components/ImportStudentsPage/ImportZone";
import Title from "../../components/common/Title";
import Grid from "../../components/ImportStudentsPage/Grid";
import Button from "../../components/common/Button"; // Notre composant bouton
import ExcelJS from "exceljs";
import "../../style/Admin.css";
import {
  matchHeader,
  validateStudentData,
} from "../../utils/studentValidation";
import toast, { Toaster } from "react-hot-toast";

function ImportStudentsPage() {
  //TODO: (@elouan) gérer cas si nom de colonne vide
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);

  const gridRef = useRef(null);

  // fonction appelée via el Context de la Grid depius EditableHeader
  const handleRename = (colId, newName) => {
    const match = matchHeader(newName);

    if (!match) {
      toast.error(
        `Le nom "${newName}" ne correspond à aucune colonne attendue.`
      );
      return;
    }

    // remapper les données
    const newRowData = rowData.map((row) => {
      const newRow = { ...row };
      newRow[match] = newRow[colId];
      // on supprime la clé avec _ignored_ devant
      delete newRow[colId];

      // re-valider la ligne
      newRow._errors = validateStudentData(newRow);
      return newRow;
    });

    // on retire la colonne ignorée (car mtn elle est placé correctement)
    const newColDefs = colDefs.filter((col) => col.field !== colId);

    setRowData(newRowData);
    setColDefs(newColDefs);
    toast.success(
      `Super, la colonne est désormais sous le bon nom : "${match}" !`
    );
  };

  const handleCellValueChanged = (params) => {
    // params.data contient la ligne modifiée
    const updatedData = params.data;

    // On recalcule les erreurs pour cette ligne
    const errors = validateStudentData(updatedData);

    // On met à jour l'objet _errors
    updatedData._errors = errors;

    // On force le rafraichissement de la ligne pour appliquer les styles (rouge/pas rouge)
    params.api.refreshCells({
      rowNodes: [params.node],
      force: true,
    });
  };

  const handleSaveAndSend = async () => {
    if (!gridRef.current || !gridRef.current.api) {
      console.error("La grille n'est pas initialisée");
      return;
    }

    const modifiedRows = [];
    gridRef.current.api.forEachNode((node) => {
      modifiedRows.push(node.data);
    });

    console.log("Données à sauvegarder :", modifiedRows);

    if (modifiedRows.length === 0) {
      toast.error("Le tableau est vide !");
      return;
    }

    // Vérification si y a la présence de colonne ignorées
    const hasIgnoredCols = colDefs.some((col) =>
      col.field.startsWith("_ignored_")
    );
    if (hasIgnoredCols) {
      toast.error(
        "Il y a des colonnes ignorées (grisées) !\nImportation impossible"
      );
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    worksheet.columns = colDefs.map((col) => ({
      header: col.field,
      key: col.field,
    }));
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
    formData.append("promo", "L3");

    try {
      const response = await fetch(`http://localhost:3000/eleve/studentList`, {
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
  };

  return (
    //TODO: (@killian) afficher pop up confirmation avant de sauvegarder (+ warning si ya encore des cellules en rouge)
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <Title>Importer un groupe d'étudiants</Title>
      <div className="content-container">
        {rowData.length > 0 ? (
          <div style={{ marginTop: 20, width: "100%" }}>
            <div
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {/* Le Bouton de sauvegarde */}
              <Button onClick={handleSaveAndSend}>
                Sauvegarder et Envoyer les modifications
              </Button>
            </div>

            <Grid
              rowData={rowData}
              colDefs={colDefs}
              gridRef={gridRef} // On passe la ref ici
              onRename={handleRename} // On passe la fonction de renommage
              onCellValueChanged={handleCellValueChanged} // Recalcul des erreurs à l'édition
            />
          </div>
        ) : (
          <ImportZone setRowData={setRowData} setColDefs={setColDefs} />
        )}
      </div>
    </div>
  );
}

export default ImportStudentsPage;
