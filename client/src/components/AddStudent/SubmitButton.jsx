import { motion } from "framer-motion";
import { FiUpload } from "react-icons/fi";

const SubmitButton = ({ disabled, loading }) => (
  <motion.button
    type="submit"
    className="submit-button"
    disabled={disabled || loading}
    whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
    whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
  >
    {loading ? (
      <>
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        Téléchargement en cours...
      </>
    ) : (
      <>
        <FiUpload /> Télécharger le Fichier
      </>
    )}
  </motion.button>
);

export default SubmitButton;
