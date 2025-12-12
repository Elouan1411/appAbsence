import React, { useState, useRef } from "react";
import ImportZone from "../../components/ImportStudentsPage/ImportZone";
import Title from "../../components/common/Title";
import Grid from "../../components/ImportStudentsPage/Grid";
import Button from "../../components/common/Button"; // Notre composant bouton
import ExcelJS from "exceljs";
import "../../style/Admin.css";
import { matchHeader, validateStudentData } from "../../utils/studentValidation";


function ImportStudentsPage() {
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);

  const gridRef = useRef(null);

  // fonction appelée via el Context de la Grid depius EditableHeader
  const handleRename = (colId, newName) => {
      const match = matchHeader(newName);
      
      if (!match) {
          alert(`Le nom "${newName}" ne correspond à aucune colonne attendue.`);
          return; // Ou on pourrait juste renommer le header sans remapper, mais l'objectif est de corriger le mapping
      }

      // remapper les données
      const newRowData = rowData.map(row => {
          const newRow = { ...row };
          newRow[match] = newRow[colId];
          // on supprime la clé avec _ignored_ devant
          delete newRow[colId];
          
          // re-valider la ligne
          newRow._errors = validateStudentData(newRow);
          return newRow;
      });

      // on retire la colonne ignorée (car mtn elle est placé correctement)
      const newColDefs = colDefs.filter(col => col.field !== colId);

      setRowData(newRowData);
      setColDefs(newColDefs);
      alert(`Super, la colonne est désormais sous le bon nom : "${match}" !`);
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
      alert("Le tableau est vide !");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    // Envoyer dans le fichier que les colonnes valides si l'utilisateur déside d'envoyer comme ca //TODO: peut etre empecher d'envoyer dans ce cas
    const validCols = colDefs.filter(col => !col.field.startsWith("_ignored_"));

    worksheet.columns = validCols.map((col) => ({
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
        alert("Succès : " + values.message);
      } else {
        alert("Erreur serveur : " + values.error);
      }
    } catch (error) {
      console.error("Erreur réseau", error);
    }
  };

  return (
    <div>
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
