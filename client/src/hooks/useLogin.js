import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const LOGIN_URL = "/login";

const useLogin = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        body: JSON.stringify({ user, pwd }),
      });

      if (response.status === 400 || response.status === 401) {
        setErrMsg("Identifiant ou mot de passe incorrect.");
        errRef.current.focus();
      } else if (response.status === 200) {
        const role = await response.json();
        setAuth({ user, role });
        setUser("");
        setPwd("");

        if (role === "admin") navigate("/admin/index", { replace: true });
        if (role === "teacher")
          navigate("/teacher/studentsList", { replace: true });
        if (role === "student") navigate("/eleve/index", { replace: true });
      } else {
        setErrMsg("Aucune réponse du serveur.");
        errRef.current.focus();
      }
    } catch (err) {
      setErrMsg("Erreur lors de la connexion.");
      errRef.current.focus();
    }
  };

  return { user, setUser, pwd, setPwd, errMsg, errRef, handleSubmit, userRef };
};

export default useLogin;
