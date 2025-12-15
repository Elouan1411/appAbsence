import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Import } from "lucide-react";
import ExcelJS from "exceljs";
import "../../style/Admin.css";
import toast, { Toaster } from "react-hot-toast";

import {
  validateStudentData,
  matchHeader,
  EXPECTED_HEADERS,
} from "../../utils/studentValidation";
import EditableHeader from "./EditableHeader";

function ImportZone({ setRowData, setColDefs }) {
  const processExcel = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      const data = [];

      // check header
      const fileHeaders = []; // { name: "nom", index: 1, mappedKey: "Nom" | null }
      const headerRow = worksheet.getRow(1);

      // parse header and add in fileHeaders
      headerRow.eachCell((cell, colNumber) => {
        const headerName = cell.value?.toString() || "";
        const mappedKey = matchHeader(headerName);
        fileHeaders.push({
          name: headerName, // nom de la colonne que le client a fourni
          index: colNumber, // l'index de la colonne que le client a fourni
          mappedKey: mappedKey, // nom de la vrai colonne attendue
        });
      });

      const gridColumns = [];

      // on parcourt les headers attendus
      EXPECTED_HEADERS.forEach((expectedKey) => {
        gridColumns.push({
          field: expectedKey, // nom de la vrai colonne attendue
          headerName: expectedKey, // nom de la vrai colonne attendue
          cellClassRules: {
            // ajout de la règle pour mettre en rouge les cellules qui ont des erreurs
            "cell-error": (params) => {
              return params.data._errors && params.data._errors[expectedKey];
            },
          },
        });
      });

      // celles du fichier client qui n'ont pas matché
      fileHeaders.forEach((fh) => {
        if (!fh.mappedKey) {
          // On l'ajoute à la fin du tableau
          gridColumns.push({
            field: `_ignored_${fh.name}`, // Préfixe pour éviter collision
            headerName: fh.name,
            headerComponent: EditableHeader, // Composant éditable pour changer le titre
            cellClass: "cell-ignored", // Style grisé
            editable: false, // On empêche l'édition car ignoré
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
          const cleanValue =
            typeof cellValue === "object" && cellValue?.result
              ? cellValue.result
              : cellValue;

          if (fh.mappedKey) {
            // Colonne reconnue -> on utilise la clé standard
            rowItem[fh.mappedKey] = cleanValue;
          } else {
            // Colonne ignorée -> on stocke sous la clé ignorée pour affichage
            rowItem[`_ignored_${fh.name}`] = cleanValue;
          }
        });

        // validation des données (fond rouge sur les cases avec erreurs)
        const errors = validateStudentData(rowItem);
        rowItem._errors = errors;

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="dropzone-container">
      <input {...getInputProps()} />
      <Import size={40} className="icon" />
      {isDragActive ? (
        <p>Déposez le fichier ici...</p>
      ) : (
        <p>Glissez-déposez vos fichiers ici...</p>
      )}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default ImportZone;
