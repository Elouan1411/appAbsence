import React, { useState, useRef } from "react";
import ImportZone from "../../components/ImportStudentsPage/ImportZone";
import Title from "../../components/common/Title";
import Grid from "../../components/ImportStudentsPage/Grid";
import Button from "../../components/common/Button"; // Votre composant bouton
import ExcelJS from "exceljs";
import "../../style/Admin.css";

function ImportStudentsPage() {
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);

  const gridRef = useRef(null);

  const handleSaveAndSend = async () => {
    if (!gridRef.current || !gridRef.current.api) return;

    const modifiedRows = [];
    gridRef.current.api.forEachNode((node) => {
      modifiedRows.push(node.data);
    });

    if (modifiedRows.length === 0) {
      alert("Aucune donnée à envoyer !");
      return;
    }

    console.log("Données modifiées récupérées :", modifiedRows);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    worksheet.columns = colDefs.map((col) => ({
      header: col.field,
      key: col.field,
      width: 20,
    }));

    worksheet.addRows(modifiedRows);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileToSend = new File([blob], "modified_students.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const formData = new FormData();
    formData.append("file", fileToSend);
    formData.append("promo", "L3");

    // const token =
    //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwd2QiOiJhcGllcnJvdC1hZG1pbiIsImlhdCI6MTc2NTM4MDM5MCwiZXhwIjoxNzY1NjM5NTkwfQ.cShqZUQQ-Mg6vfO0GhbDcI1NSxWSd9pWASqKhwKR22I";

    try {
      const response = await fetch("http://localhost:3000/eleve/studentList", {
        method: "POST",
        headers: {
          // Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        credentials: "include",
        body: formData,
      });

      const values = await response.json();
      if (response.ok) {
        alert("Modifications sauvegardées et envoyées avec succès !");
      } else {
        alert("Erreur lors de l'envoi : " + values.error);
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
          <div style={{ marginTop: 20 }}>
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
