import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import CustomLoader from "../common/CustomLoader";
import { alertConfirm } from "../../hooks/alertConfirm";
import { useAuth } from "../../hooks/useAuth";
import "../../style/SettingsPage.css";
import notify from "../../functions/notify";

const DatabaseResetCard = ({ onExportDump }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isResetLoading, setIsResetLoading] = useState(false);
    const [isRestoreLoading, setIsRestoreLoading] = useState(false);
    const [isBackupLoading, setIsBackupLoading] = useState(false);
    const [isFullResetLoading, setIsFullResetLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleReset = async () => {
        setIsBackupLoading(true);
        toast("Lancement de la sauvegarde automatique...", { icon: "⏳" });
        const success = await onExportDump();
        setIsBackupLoading(false);

        if (!success) {
            notify("Sauvegarde échouée. Action annulée par sécurité.", "error");
            return;
        }

        const { isConfirmed: confirmDelete } = await alertConfirm(
            "ATTENTION : Suppression !",
            "La sauvegarde a été lancée. Voulez-vous maintenant supprimer le contenu des tables : Appel, Absence, Eleve, Justification, RSE ? Action IRRÉVERSIBLE.",
            false,
            false,
        );

        if (confirmDelete) {
            try {
                setIsResetLoading(true);
                const response = await fetch(`${API_URL}/database/reset-specific`, {
                    method: "DELETE",
                    credentials: "include",
                });

                if (response.ok) {
                    notify("Données réinitialisées avec succès.", "success");
                } else {
                    const data = await response.json();
                    notify(data.error || "Erreur lors de la réinitialisation.", "error");
                }
            } catch (error) {
                console.error(error);
                notify("Erreur serveur.", "error");
            } finally {
                setIsResetLoading(false);
            }
        }
    };

    const handleFullReset = async () => {
        setIsFullResetLoading(true);
        toast("Lancement de la sauvegarde automatique...", { icon: "⏳" });
        const success = await onExportDump();
        setIsFullResetLoading(false);

        if (!success) {
            notify("Sauvegarde échouée. Action annulée par sécurité.", "error");
            return;
        }

        const { isConfirmed: confirmFullDelete } = await alertConfirm(
            "DANGER : RÉINITIALISATION TOTALE",
            "ATTENTION : Vous allez supprimer TOUTES les données (Profs, Admins, Matières, Groupes...). \n\nVous serez déconnecté et devrez vous reconnecter avec le compte par défaut 'admin' / 'admin'.",
            false,
            false,
        );

        if (confirmFullDelete) {
            try {
                setIsFullResetLoading(true);
                const response = await fetch(`${API_URL}/database/reset-full`, {
                    method: "DELETE",
                    credentials: "include",
                });

                if (response.ok) {
                    notify("Base de données entièrement réinitialisée. Déconnexion...", "success");
                    setTimeout(async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error("Logout error during reset:", error);
                        }
                        navigate("/", { replace: true });
                        window.location.reload();
                    }, 1500);
                } else {
                    const data = await response.json();
                    notify(data.error || "Erreur lors de la réinitialisation complète.", "error");
                    setIsFullResetLoading(false);
                }
            } catch (error) {
                console.error(error);
                notify("Erreur serveur.", "error");
                setIsFullResetLoading(false);
            }
        }
    };

    const handleRestoreClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        event.target.value = "";

        const { isConfirmed } = await alertConfirm(
            "Restaurer la base ?",
            `Voulez-vous écraser la base actuelle avec le fichier "${file.name}" ? Assurez-vous d'avoir une sauvegarde avant.`,
            false,
            false,
        );

        if (isConfirmed) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                setIsRestoreLoading(true);
                const response = await fetch(`${API_URL}/database/restore`, {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                });

                if (response.ok) {
                    notify("Base de données restaurée avec succès !", "success");
                } else {
                    const data = await response.json();
                    notify(data.error || "Erreur lors de la restauration.", "error");
                }
            } catch (error) {
                console.error(error);
                notify("Erreur connexion serveur.", "error");
            } finally {
                setIsRestoreLoading(false);
            }
        }
    };

    return (
        <div className="Card cols-2 settings-db-reset-card settings-reset-card-container">
            <h2 className="settings-reset-main-title">Maintenance de la Base de Données</h2>

            {/* Section Nouvelle Année */}
            <div className="settings-reset-section">
                <h3 className="settings-reset-section-title">Nouvelle Année Scolaire</h3>
                <p className="settings-reset-description">
                    Préparez la rentrée en supprimant uniquement les données des élèves (Appels, Absences, Justificatifs, Comptes élèves).
                    <br />
                    <strong>Conservé :</strong> Comptes Professeurs & Admin, Matières, Groupes, Configuration RSE.
                </p>
                <button
                    onClick={handleReset}
                    className="validate-btn settings-input-margin-fix settings-btn-full settings-btn-danger settings-reset-margin-top"
                    disabled={isResetLoading || isBackupLoading || isFullResetLoading}
                >
                    {isResetLoading || isBackupLoading ? <CustomLoader /> : "Réinitialiser pour une nouvelle année"}
                </button>
            </div>

            <hr className="settings-reset-separator" />

            {/* Section Danger Absolu */}
            <div className="settings-reset-section">
                <h3 className="settings-reset-section-title">Actions Destructrices</h3>
                <p className="settings-reset-description">
                    Attention : Ces actions affectent l'intégralité de la base de données.
                    <br />• <strong>Réinitialisation Complète :</strong> Supprime TOUTES les données. Vous serez déconnecté (Admin par défaut restauré).
                    <br />• <strong>Restauration :</strong> Conçue pour importer un fichier SQL exporté par ce même logiciel. La structure de la base de données
                    reste INCHANGÉE (seules les instructions INSERT INTO sont traitées).
                </p>

                <div className="settings-reset-actions-group">
                    <input type="file" accept=".sql" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

                    <button
                        onClick={handleFullReset}
                        className="validate-btn settings-input-margin-fix settings-btn-full settings-btn-danger"
                        style={{ flex: 1, minWidth: "200px" }}
                        disabled={isFullResetLoading || isBackupLoading || isResetLoading}
                    >
                        {isFullResetLoading ? <CustomLoader /> : "Réinitialisation COMPLÈTE"}
                    </button>

                    <button
                        onClick={handleRestoreClick}
                        className="validate-btn settings-input-margin-fix settings-btn-full settings-btn-danger"
                        disabled={isRestoreLoading}
                        style={{ flex: 1, minWidth: "200px" }}
                    >
                        {isRestoreLoading ? <CustomLoader /> : "Restaurer une sauvegarde (.sql)"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatabaseResetCard;
