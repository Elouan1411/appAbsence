import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import AddStudentsHeader from "../components/AddStudent/AddStudentHeader";
import InstructionsCard from "../components/AddStudent/InstructionCard";
import PromoSelector from "../components/AddStudent/PromoSelector";
import FileInput from "../components/AddStudent/FileInput";
import ErrorMessage from "../components/ErrorMessage";
import SubmitButton from "../components/AddStudent/SubmitButton";
import SuccessNotification from "../components/SuccessNotification";

import useFileUpload from "../hooks/useFileUpload";

import "../style/AddStudents.css";

const AddStudentPage = () => {
  const navigate = useNavigate();
  const [promo, setPromo] = useState("L1");

  const {
    file,
    fileName,
    error,
    success,
    isSubmitting,
    handleFileChange,
    handleDrop,
    handleSubmit,
    setError,
    setSuccess,
  } = useFileUpload(promo);

  const goBack = () => navigate("/admin/index");

  return (
    <motion.div
      className="add-students-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AddStudentsHeader onBack={goBack} />

      <motion.div
        className="add-students-content"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <InstructionsCard />

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-card">
            <div className="card-header">
              <h2> Téléchargement du Fichier des Étudiants </h2>
            </div>

            <div className="form-content">
              <PromoSelect value={promo} onChange={setPromo} />

              <FileDropzone
                file={file}
                fileName={fileName}
                onFileChange={handleFileChange}
                onDropFile={handleDrop}
              />

              <AnimatePresence>
                {error && <ErrorMessage message={error} />}
              </AnimatePresence>

              <SubmitButton disabled={!file} loading={isSubmitting} />
            </div>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {success && <SuccessNotification onClose={() => setSuccess(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default AddStudentPage;
