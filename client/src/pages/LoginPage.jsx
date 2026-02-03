import React, { use, useEffect } from "react";
import "../style/login.css";
import InputField from "../components/common/InputField";
import Button from "../components/common/Button";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Title from "../components/common/Title";
import Subtitle from "../components/common/Subtitle";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CustomLoader from "../components/common/CustomLoader";
function LoginPage() {
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const sanitizedUser = user.trim();
        const sanitizedPassword = password.trim();

        try {
            const role = await login(sanitizedUser, sanitizedPassword);
            if (role === "admin") {
                navigate("/admin/", { replace: true });
            } else if (role === "teacher") {
                navigate("/enseignant/", { replace: true });
            } else if (role === "student") {
                navigate("/etudiant/", { replace: true });
            } else {
                navigate("/error", { replace: true });
            }
            toast.success("Connexion réussie.");
        } catch (error) {
            let msg = error.message.replaceAll('"', "");
            if (msg.includes("Failed to fetch")) {
                msg = "Impossible de contacter le serveur.";
            }
            toast.error(msg);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form-container" onSubmit={handleSubmit}>
                <div className="login-header">
                    <div className="circle">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                            <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z" />
                        </svg>
                    </div>
                    <Title>Gestionnaire des absences</Title>
                    <Subtitle>Connectez-vous pour accéder à votre compte</Subtitle>
                </div>
                <div className="input-container">
                    <InputField
                        placeholder="votre.email@example.com"
                        text="Email"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        autocomplete="username"
                    />
                    <InputField
                        placeholder="motdepasse"
                        text="Mot de passe"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        rightIcon={
                            showPassword ? (
                                <span className="icon icon-eye-close icon-xl icon-primary" />
                            ) : (
                                <span className="icon icon-eye icon-xl icon-primary" />
                            )
                        }
                        onRightIconClick={() => setShowPassword(!showPassword)}
                        autocomplete="current-password"
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? <CustomLoader /> : "Se connecter"}
                </Button>

                <hr />

                <div className="bottom-text-container">
                    <p>Les identifiants sont identiques à ceux utilisés sur l'ENT.</p>
                    <p className="text-credit">© 2025 - Elouan Boiteux, Killian Mathias, Aymeric Mariaux</p>
                </div>
            </form>
        </div>
    );
}

export default LoginPage;
