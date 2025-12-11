import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Import } from "lucide-react";
import ExcelJS from "exceljs";
import "../../style/Admin.css";

function ImportZone({ setRowData, setColDefs }) {
  const processExcel = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];

      let headers = [];
      let data = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          row.eachCell((cell) => {
            headers.push(cell.value);
          });
          const columns = headers.map((header) => ({ field: header }));

          if (setColDefs) setColDefs(columns);
        } else {
          let rowItem = {};
          headers.forEach((header, index) => {
            const cellValue = row.getCell(index + 1).value;

            rowItem[header] =
              typeof cellValue === "object" && cellValue?.result
                ? cellValue.result
                : cellValue;
          });
          data.push(rowItem);
        }
      });

      if (setRowData) setRowData(data);
      console.log(`${data.length} lignes importées localement.`);
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier Excel :", error);
      alert("Impossible de lire le fichier Excel.");
    }
  };

  const handlePostFile = async (acceptedFile) => {
    const formData = new FormData();
    formData.append("file", acceptedFile);
    formData.append("promo", "L3");

    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwd2QiOiJhcGllcnJvdC1hZG1pbiIsImlhdCI6MTc2NTM4MDM5MCwiZXhwIjoxNzY1NjM5NTkwfQ.cShqZUQQ-Mg6vfO0GhbDcI1NSxWSd9pWASqKhwKR22I";

    try {
      const response = await fetch("http://localhost:3000/eleve/studentList", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: formData,
      });

      const values = await response.json();

      if (!response.ok) {
        console.error("Erreur serveur :", values.error);
        alert(`Erreur serveur: ${values.error}`);
        return;
      }

      console.log("Succès serveur :", values.message);
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      console.log("Fichier reçu :", file.name);

      const extension = file.name.split(".").pop().toLowerCase();

      if (extension !== "xlsx" && extension !== "csv") {
        alert("Extension de fichier invalide. Veuillez utiliser .xlsx ou .csv");
        return;
      }

      if (extension === "xlsx") {
        processExcel(file);
      }

      handlePostFile(file);
    },
    [setRowData, setColDefs]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="dropzone-container">
      <input {...getInputProps()} />
      <Import size={40} className="icon" />
      {isDragActive ? (
        <p>Déposez le fichier ici...</p>
      ) : (
        <p>
          Glissez-déposez vos fichiers ici ou cliquez pour importer un
          fichier...
        </p>
      )}
    </div>
  );
}

export default ImportZone;
