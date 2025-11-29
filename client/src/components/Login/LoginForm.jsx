import { useRef } from "react";
import { motion } from "framer-motion";
import InputField from "../InputField";
import ErrorMessage from "../ErrorMessage";
import useLogin from "../../hooks/useLogin";
import { FiLock } from "react-icons/fi";

const LoginForm = () => {
  const { user, setUser, pwd, setPwd, errMsg, errRef, handleSubmit } =
    useLogin();

  return (
    <>
      {errMsg && <ErrorMessage message={errMsg} refElement={errRef} />}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <InputField
          id="username"
          label="Identifiant"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Entrez votre identifiant"
          ref={useRef}
        />

        <InputField
          id="password"
          label="Mot de passe"
          type="password"
          icon={<FiLock />}
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Entrez votre mot de passe"
        />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Se connecter
        </motion.button>
      </motion.form>
    </>
  );
};

export default LoginForm;
