import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Import } from "lucide-react";
import ExcelJS from "exceljs";
import "../../style/Admin.css";
import { validateStudentData, EXPECTED_HEADERS } from "../../utils/studentValidation";

function ImportZone({ setRowData, setColDefs }) {
  const processExcel = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      const data = [];

      const forcedHeaders = EXPECTED_HEADERS; // ["Numéro", "Login", "Nom", "Prénom", "Promo", "Groupe TD", "Groupe TP", "Promo Pair", "Groupe TD Pair", "Groupe TP Pair"]

      // Configuration des colonnes pour la Grid (on utilise nos headers forcés)
      const columns = forcedHeaders.map((header) => ({ 
             field: header,
             cellClassRules: {
                'cell-error': (params) => {
                    return params.data._errors && params.data._errors[header];
                }
            }
      }));
      if (setColDefs) setColDefs(columns);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // On ignore la ligne d'en-tête pour l'instant

        let rowItem = {};
        
        // On mappe par INDEX (Colonne 1 -> forcedHeaders[0], etc.)
        forcedHeaders.forEach((headerName, index) => {
            // ExcelJS commence les colonnes à 1
            const cellValue = row.getCell(index + 1).value;

            // Remplir rowItem avec les valeurs du fichier
            rowItem[headerName] =
            typeof cellValue === "object" && cellValue?.result
              ? cellValue.result
              : cellValue;
        });

        // Vérification des données de la ligne
        const errors = validateStudentData(rowItem);
        rowItem._errors = errors;

        data.push(rowItem);
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

      // handlePostFile(file); // Désactivé pour tester la validation locale (est ce qu'on veut que ca soit activé ? je trouve que non)
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
