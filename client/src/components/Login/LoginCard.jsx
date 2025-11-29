import { motion } from "framer-motion";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";

const LoginCard = () => {
  return (
    <motion.div
      className="login-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <LoginHeader />
      <LoginForm />
    </motion.div>
  );
};

export default LoginCard;
