import { useState } from "react";

const SEND_URL = "/post/studentList";

const useFileUpload = (promo) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.name.endsWith(".xlsx")) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileType("excel");
      setError(null);
    } else if (selectedFile.name.endsWith(".pdf")) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileType("pdf");
      setError(null);
    } else {
      setFile(null);
      setFileName("");
      setFileType(null);
      setError("Veuillez sélectionner un fichier Excel (.xlsx) ou PDF (.pdf)");
    }
  };

  const handleFileChange = (e) => {
    validateFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    validateFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("promo", promo);
      formData.append("file", file);
      formData.append("fileType", fileType);

      const response = await fetch(SEND_URL, {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        setSuccess(true);
        setFile(null);
        setFileName("");
        setFileType(null);
      } else {
        setError("Échec de l’envoi du fichier.");
      }
    } catch (err) {
      setError("Erreur lors du téléchargement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    file,
    fileName,
    fileType,
    error,
    success,
    isSubmitting,
    handleFileChange,
    handleDrop,
    handleSubmit,
    setError,
    setSuccess,
  };
};

export default useFileUpload;
