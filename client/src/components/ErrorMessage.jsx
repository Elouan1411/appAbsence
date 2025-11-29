import { motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";

const ErrorMessage = ({ message }) => (
  <motion.div
    className="error-message"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
  >
    <FiAlertCircle /> {message}
  </motion.div>
);

export default ErrorMessage;
