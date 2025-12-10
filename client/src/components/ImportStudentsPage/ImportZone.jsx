import React, { useCallback } from "react";
import Button from "../common/Button";
import { useDropzone } from "react-dropzone";
import "../../style/Admin.css";
import { Import } from "lucide-react";
function ImportZone() {
  const onDrop = useCallback((acceptedFiles) => {
    console.log("Fichier reçu :", acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <div {...getRootProps()} className="dropzone-container">
      <input {...getInputProps()} />
      <Import size={40} />
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
