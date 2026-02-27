import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import PageTitle from "../components/common/PageTitle";
import Button from "../components/common/Button";
import InputField from "../components/common/InputField";
import CustomLoader from "../components/common/CustomLoader";
import "../style/Admin.css";
import "../style/icon.css";
import "../style/Student.css";
import "../style/SelectGroups.css";
import "../style/SettingsPage.css";
import { alertConfirm } from "../hooks/alertConfirm";
import notify from "../functions/notify";

const InitPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        loginENT: "",
        nom: "",
        prenom: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { isConfirmed } = await alertConfirm(
            "Vérification du login",
            `Êtes-vous sûr que votre login ENT est bien "${formData.loginENT}" ?\nIl sera impossible de se connecter si ce login est incorrect.`,
            false,
            true,
        );

        if (!isConfirmed) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/register-first-admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
                credentials: "include",
            });

            if (response.status === 200) {
                notify("Compte administrateur créé avec succès !", "success");
                await logout();
                navigate("/");
            } else {
                const errorText = await response.text();
                notify(errorText || "Erreur lors de la création du compte.", "error");
            }
        } catch (error) {
            console.error("Erreur création admin:", error);
            notify("Erreur lors de la création du compte.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <PageTitle title="Configuration initiale" icon="icon-settings-2" />

            <div className="content-container">
                <div className="Card cols-2" style={{ maxWidth: "800px" }}>
                    <h2>Création du premier administrateur</h2>

                    <div style={{ gridColumn: "1 / -1", marginBottom: "20px" }}>
                        <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                            Bienvenue sur votre gestionnaire d'absences. Aucun administrateur n'a été détecté. Vous êtes connecté avec le compte de
                            configuration temporaire. Veuillez créer votre premier compte administrateur ci-dessous. Ce compte sera lié au login ENT renseigné
                            ainsi qu'au mot de passe lié au compte ENT.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "contents" }}>
                        <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                            <InputField text="Login ENT" placeholder="ex: jdupont" name="loginENT" value={formData.loginENT} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <InputField text="Nom" placeholder="ex: Dupont" name="nom" value={formData.nom} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <InputField text="Prénom" placeholder="ex: Jean" name="prenom" value={formData.prenom} onChange={handleChange} required />
                        </div>

                        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", marginTop: "20px" }}>
                            <Button type="submit" disabled={loading} className="validate-btn">
                                {loading ? <CustomLoader /> : "Créer l'administrateur"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InitPage;
