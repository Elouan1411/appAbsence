import { motion } from "framer-motion";

const LoginHeader = () => {
  return (
    <div className="login-header">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Connexion
      </motion.h1>
    </div>
  );
};

export default LoginHeader;
