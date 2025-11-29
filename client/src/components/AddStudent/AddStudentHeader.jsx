import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";

const AddStudentsHeader = ({ onBack }) => {
  return (
    <div className="add-students-header">
      <motion.button
        className="back-button"
        onClick={onBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiArrowLeft /> Retour au Tableau de Bord
      </motion.button>

      <h1>Ajouter des Étudiants</h1>
    </div>
  );
};

export default AddStudentsHeader;
