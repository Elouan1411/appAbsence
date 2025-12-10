import React, { useCallback } from "react";
import Button from "../common/Button";
import { useDropzone } from "react-dropzone";
import "../../style/Admin.css";
import { Import } from "lucide-react";
function ImportZone() {
  const onDrop = useCallback((acceptedFiles) => {
    console.log("Fichier reçu :", acceptedFiles);
    const extension = acceptedFiles[0].name.split(".").pop().toLowerCase();
    console.log(extension);
    if (extension != "xlsx" && extension != "csv") {
      alert("Extension de fichier invalide");
    }
    handlePostFile(acceptedFiles);
  }, []);

  const handlePostFile = async (acceptedFile) => {
    const data = await fetch("http://localhost:3000/eleve/studentList", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwd2QiOiJhcGllcnJvdC1hZG1pbiIsImlhdCI6MTc2NTM4MDM5MCwiZXhwIjoxNzY1NjM5NTkwfQ.cShqZUQQ-Mg6vfO0GhbDcI1NSxWSd9pWASqKhwKR22I"}`,
      },
      credentials: "include",
      body: JSON.stringify({ file: acceptedFile, promo: "L3" }),
    });

    const values = await data.json();

    if (data.status === 500) {
      console.log("Erreur", values.error);
      return;
    }
    if (data.status === 400) {
      console.log("Erreur", values.error);
      return;
    }

    if (data.status === 200) {
      console.log(values.message);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <div {...getRootProps()} className="dropzone-container">
      <input {...getInputProps()} />
      <Import size={40} className="icon" />
      {isDragActive ? (
        <p>Déposez les fichiers ici...</p>
      ) : (
        <p>
          Glissez-déposez vos fichiers ici ou cliquez pour importez un
          fichier...
        </p>
      )}
    </div>
  );
}

export default ImportZone;
