import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

const SuccessNotification = ({ onClose }) => (
  <motion.div
    className="success-notification"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    onAnimationComplete={() => setTimeout(onClose, 3000)}
  >
    <div className="success-icon">
      <FiCheck />
    </div>
    <p>Fichier téléchargé avec succès !</p>
  </motion.div>
);

export default SuccessNotification;
