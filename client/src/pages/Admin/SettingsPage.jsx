import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import PageTitle from "../../components/common/PageTitle";
import "../../style/Admin.css";
import "../../style/icon.css";
import "../../style/Student.css";
import "../../style/StudentMobile.css";
import "../../style/SelectGroups.css";
import "../../style/SettingsPage.css";
import { alertConfirm } from "../../hooks/alertConfirm";
import toast from "react-hot-toast";
import SubjectModal from "../../components/Admin/SubjectModal";
import RSEModal from "../../components/Admin/RSEModal";
import { API_URL } from "../../config";
import CustomLoader from "../../components/common/CustomLoader";
import DatabaseResetCard from "../../components/Settings/DatabaseResetCard";

function SettingsPage() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("admin");
    const [adminLogin, setAdminLogin] = useState("");
    const [adminToRemove, setAdminToRemove] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);

    const [promotions, setPromotions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [rses, setRses] = useState([]);

    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isRSEModalOpen, setIsRSEModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [editingRSE, setEditingRSE] = useState(null);

    const [filterPromo, setFilterPromo] = useState("");
    const [filterSemester, setFilterSemester] = useState("");

    const [isSubjectLoading, setIsSubjectLoading] = useState(false);
    const [isRSELoading, setIsRSELoading] = useState(false);
    const [isAdminLoading, setIsAdminLoading] = useState(false);
    const [deletingSubjectId, setDeletingSubjectId] = useState(null);
    const [deletingRSEId, setDeletingRSEId] = useState(null);

    const [isSchemaStructureLoading, setisSchemaStructureLoading] = useState(false);
    const [isBackUpSQLLoading, setIsBackUpSQLLoading] = useState(false);
    const [isBackUpDBLoading, setIsBackUpDBLoading] = useState(false);

    const [years, setYears] = useState([]);
    const [totalSize, setTotalSize] = useState(0);
    const [selectedYear, setSelectedYear] = useState("");

    const [isExportXLSXLoading, setIsExportXLSXLoading] = useState(false);
    const [isExportRSELoading, setIsExportRSELoading] = useState(false);
    const [isDownloadAllJustifLoading, setIsDownloadAllJustifLoading] = useState(false);
    const [isDownloadYearJustifLoading, setIsDownloadYearJustifLoading] = useState(false);
    const [isDeleteAllJustifLoading, setIsDeleteAllJustifLoading] = useState(false);
    const [isDeleteYearJustifLoading, setIsDeleteYearJustifLoading] = useState(false);

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`${API_URL}/subject`, { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des matières:", error);
        }
    };

    const fetchContactEmail = async () => {
        try {
            const response = await fetch(`${API_URL}/contact_email`, { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setContactEmail(data || "");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'email de contact:", error);
        }
    };

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await fetch(`${API_URL}/groups/promo`, { credentials: "include" });
                if (response.ok) {
                    const data = await response.json();
                    setPromotions(data.map((item) => item.promo).sort());
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des promos:", error);
                setPromotions(["L2", "L3", "M1", "M2"]);
            }
        };

        const fetchTeachers = async () => {
            try {
                const response = await fetch(`${API_URL}/teacher/all`, { credentials: "include" });
                if (response.ok) {
                    const data = await response.json();
                    data.sort((a, b) => a.nom.localeCompare(b.nom));
                    setTeachers(data);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des enseignants:", error);
            }
        };

        fetchPromotions();
        fetchTeachers();
        fetchSubjects();
        fetchRSEs();
        fetchContactEmail();
    }, []);

    const fetchYears = async () => {
        try {
            const response = await fetch(`${API_URL}/file/years`, { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                setYears(data.years || []);
                setTotalSize(data.totalSize || 0);
            }
        } catch (error) {
            console.error("Erreur récupération années:", error);
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    useEffect(() => {
        if (activeTab === "database") {
            fetchYears();
        }
    }, [activeTab]);

    const handleDownloadJustifications = async (isYear) => {
        const url = isYear ? `/file/download-year/${selectedYear}` : "/file/download-all";
        const filename = isYear ? `justifications_${selectedYear}.zip` : "all_justifications.zip";

        if (isYear) setIsDownloadYearJustifLoading(true);
        else setIsDownloadAllJustifLoading(true);

        try {
            const response = await fetch(`${API_URL}${url}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                toast.success("Téléchargement lancé.");
            } else {
                toast.error("Erreur de téléchargement.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Erreur serveur.");
        } finally {
            if (isYear) setIsDownloadYearJustifLoading(false);
            else setIsDownloadAllJustifLoading(false);
        }
    };

    const handleDeleteJustifications = async () => {
        const { isConfirmed } = await alertConfirm("SUPPRIMER TOUS LES FICHIERS ?", "Cette action supprimera DÉFINITIVEMENT tous les justificatifs.");
        if (isConfirmed) {
            performDelete("/file/delete-all", setIsDeleteAllJustifLoading);
        }
    };

    const handleDeleteYearJustifications = async () => {
        const { isConfirmed } = await alertConfirm(
            `SUPPRIMER FICHIERS ${selectedYear} ?`,
            `Supprimer les justificatifs de l'année ${selectedYear} - ${parseInt(selectedYear) + 1} ?`,
        );
        if (isConfirmed) {
            performDelete(`/file/delete-year/${selectedYear}`, setIsDeleteYearJustifLoading);
        }
    };

    const performDelete = async (endpoint, setLoading) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                toast.success(data.message || "Suppression effectuée.");
                fetchYears();
            } else {
                toast.error("Erreur lors de la suppression.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Erreur serveur.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEmail = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactEmail)) {
            toast.error("Format d'email invalide");
            return;
        }

        try {
            setIsEmailLoading(true);
            const response = await fetch(`${API_URL}/contact_email`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contact_email: contactEmail }),
                credentials: "include",
            });

            if (response.ok) {
                toast.success("Email de contact mis à jour !");
            } else {
                toast.error("Erreur lors de la mise à jour.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur serveur.");
        } finally {
            setIsEmailLoading(false);
        }
    };

    const handleAddAdmin = async () => {
        if (!adminLogin.trim()) {
            toast.error("Veuillez sélectionner un enseignant.");
            return;
        }

        const { isConfirmed } = await alertConfirm("Êtes-vous sûr ?", `Voulez-vous vraiment ajouter ${adminLogin} en tant qu'administrateur ?`);

        if (isConfirmed) {
            try {
                setIsAdminLoading(true);
                const response = await fetch(`${API_URL}/teacher/${adminLogin}/admin`, {
                    method: "PUT",
                    credentials: "include",
                });

                if (response.ok) {
                    toast.success(`Administrateur ${adminLogin} ajouté avec succès !`);
                    setAdminLogin("");
                } else {
                    toast.error("Erreur lors de l'ajout.");
                }
            } catch (error) {
                console.error("Erreur:", error);
                toast.error("Erreur connexion serveur.");
            } finally {
                setIsAdminLoading(false);
            }
        }
    };

    const handleRemoveAdmin = async () => {
        if (!adminToRemove.trim()) {
            toast.error("Veuillez sélectionner un administrateur.");
            return;
        }

        const { isConfirmed } = await alertConfirm("Retirer les droits ?", `Voulez-vous vraiment retirer les droits d'administrateur à ${adminToRemove} ?`);

        if (isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/teacher/${adminToRemove}/admin`, {
                    method: "DELETE",
                    credentials: "include",
                });

                if (response.ok) {
                    toast.success(`Droits retirés pour ${adminToRemove}.`);
                    setTeachers((prev) => prev.map((t) => (t.loginENT === adminToRemove ? { ...t, administrateur: 0 } : t)));
                    setAdminToRemove("");
                } else {
                    toast.error("Erreur lors de la suppression.");
                }
            } catch (error) {
                console.error("Erreur:", error);
                toast.error("Erreur serveur.");
            }
        }
    };

    const handleSaveSubject = async (formData) => {
        const { libelle, promo, semester } = formData;
        const spairValue = semester === "Pair" ? 1 : 0;

        try {
            setIsSubjectLoading(true);
            let response;
            if (editingSubject) {
                response = await fetch(`${API_URL}/subject/${editingSubject.code}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        libelle: libelle,
                        promo: promo,
                        spair: spairValue,
                    }),
                    credentials: "include",
                });
            } else {
                response = await fetch(`${API_URL}/subject/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        libelle: libelle,
                        promo: promo,
                        spair: spairValue,
                    }),
                    credentials: "include",
                });
            }

            if (response.ok) {
                toast.success(editingSubject ? "Matière modifiée avec succès !" : "Matière ajoutée avec succès !");
                fetchSubjects();
                setIsSubjectModalOpen(false);
                setEditingSubject(null);
            } else {
                toast.error("Erreur lors de l'enregistrement.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Erreur de communication avec le serveur.");
        } finally {
            setIsSubjectLoading(false);
        }
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setIsSubjectModalOpen(true);
    };

    const handleDeleteSubject = async (id) => {
        const { isConfirmed } = await alertConfirm("Supprimer la matière ?", "Cette action est irréversible.");
        if (isConfirmed) {
            try {
                setDeletingSubjectId(id);
                const response = await fetch(`${API_URL}/subject/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                });

                if (response.ok) {
                    toast.success("Matière supprimée.");
                    fetchSubjects();
                } else {
                    toast.error("Erreur lors de la suppression.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Erreur de communication avec le serveur.");
            } finally {
                setDeletingSubjectId(null);
            }
        }
    };

    const filteredSubjects = subjects.filter((sub) => {
        const promoMatch = filterPromo ? sub.promo === filterPromo : true;

        let semesterMatch = true;
        if (filterSemester === "Pair") {
            semesterMatch = sub.spair === 1;
        } else if (filterSemester === "Impair") {
            semesterMatch = sub.spair === 0;
        }

        return promoMatch && semesterMatch;
    });

    const fetchRSEs = async () => {
        try {
            const response = await fetch(`${API_URL}/rse`, { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                setRses(data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des RSE:", error);
        }
    };

    const handleSaveRSE = async (formData) => {
        const { libelle } = formData;

        try {
            setIsRSELoading(true);
            let response;
            if (editingRSE) {
                response = await fetch(`${API_URL}/rse/update/${editingRSE.code}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ libelle }),
                    credentials: "include",
                });
            } else {
                response = await fetch(`${API_URL}/rse/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ libelle }),
                    credentials: "include",
                });
            }

            if (response.ok) {
                toast.success(editingRSE ? "RSE modifié avec succès !" : "RSE ajouté avec succès !");
                fetchRSEs();
                setIsRSEModalOpen(false);
                setEditingRSE(null);
            } else {
                toast.error("Erreur lors de l'enregistrement.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Erreur de communication avec le serveur.");
        } finally {
            setIsRSELoading(false);
        }
    };

    const handleEditRSE = (rse) => {
        setEditingRSE(rse);
        setIsRSEModalOpen(true);
    };

    const handleDeleteRSE = async (id) => {
        const { isConfirmed } = await alertConfirm("Supprimer ce RSE ?", "Cette action est irréversible.");
        if (isConfirmed) {
            try {
                setDeletingRSEId(id);
                const response = await fetch(`${API_URL}/rse/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                });

                if (response.ok) {
                    toast.success("RSE supprimé.");
                    fetchRSEs();
                } else {
                    toast.error("Erreur lors de la suppression.");
                }
            } catch (err) {
                console.error(err);
                toast.error("Erreur de communication avec le serveur.");
            } finally {
                setDeletingRSEId(null);
            }
        }
    };


    const handleExportRSE = async () => {
        handleDatabaseExport(
            "/rse/export",
            "export_rse.xlsx",
            "Fichier RSE exporté avec succès.",
            setIsExportRSELoading
        );
    };

    const handleDatabaseExport = async (endpoint, defaultFilename, successMessage, setLoading) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                // get le nom du fichier depuis le header
                const disposition = response.headers.get("Content-Disposition");
                let filename = defaultFilename;
                if (disposition && disposition.indexOf("filename=") !== -1) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, "");
                    }
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                toast.success(successMessage);
                return true;
            } else {
                toast.error("Erreur lors de l'export.");
                return false;
            }
        } catch (err) {
            console.error(err);
            toast.error("Erreur connexion serveur.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <PageTitle title="Paramètres" icon="icon-settings">
                {activeTab === "subject" && (
                    <button
                        className="validate-btn"
                        style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "15px" }}
                        onClick={() => {
                            setEditingSubject(null);
                            setIsSubjectModalOpen(true);
                        }}
                    >
                        <span className="icon icon-plus" style={{ backgroundColor: "white" }}></span>
                        Ajouter
                    </button>
                )}
                {activeTab === "rse" && (
                    <button
                        className="validate-btn"
                        style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "15px" }}
                        onClick={() => {
                            setEditingRSE(null);
                            setIsRSEModalOpen(true);
                        }}
                    >
                        <span className="icon icon-plus" style={{ backgroundColor: "white" }}></span>
                        Ajouter
                    </button>
                )}
            </PageTitle>

            <div className="adding-container">
                <div className="dashboard-tabs">
                    <button className={`dashboard-tab ${activeTab === "admin" ? "active" : ""}`} onClick={() => setActiveTab("admin")}>
                        <span className="tab-dot"></span>
                        Administrateurs
                    </button>
                    <button className={`dashboard-tab ${activeTab === "subject" ? "active" : ""}`} onClick={() => setActiveTab("subject")}>
                        <span className="tab-dot"></span>
                        Matières
                    </button>
                    <button className={`dashboard-tab ${activeTab === "rse" ? "active" : ""}`} onClick={() => setActiveTab("rse")}>
                        <span className="tab-dot"></span>
                        RSE
                    </button>
                    <button className={`dashboard-tab ${activeTab === "database" ? "active" : ""}`} onClick={() => setActiveTab("database")}>
                        <span className="tab-dot"></span>
                        Base de données
                    </button>
                </div>
            </div>

            <div className="content-container">
                {activeTab === "admin" && (
                    <div className="admin-settings">
                        <div className="Card cols-2">
                            <h2>Ajouter un administrateur</h2>

                            <div className="input-group">
                                <label>Login ENT</label>
                                <select value={adminLogin} onChange={(e) => setAdminLogin(e.target.value)}>
                                    <option value=""> -- Sélectionner un enseignant -- </option>
                                    {teachers
                                        .filter((teacher) => teacher.administrateur !== 1)
                                        .map((teacher) => (
                                            <option key={teacher.loginENT} value={teacher.loginENT}>
                                                {teacher.nom.toUpperCase()} {teacher.prenom} ({teacher.loginENT})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <button onClick={handleAddAdmin} className="validate-btn settings-input-margin-fix" disabled={isAdminLoading}>
                                {isAdminLoading ? <CustomLoader /> : "Ajouter l'administrateur"}
                            </button>
                        </div>
                        <div className="Card cols-2">
                            <h2>Email de contact</h2>
                            <div className="input-group">
                                <label>Email de contact (support)</label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    placeholder="support@univ.fr"
                                    className="input-field"
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border-color)",
                                        backgroundColor: "var(--background-color)",
                                        color: "var(--text-primary)",
                                    }}
                                />
                            </div>
                            <button onClick={handleSaveEmail} className="validate-btn settings-input-margin-fix" disabled={isEmailLoading}>
                                {isEmailLoading ? <CustomLoader /> : "Sauvegarder"}
                            </button>
                        </div>
                        <div className="Card cols-2">
                            <h2>Liste des administrateurs</h2>
                            <div className="input-group">
                                <label>Retirer un administrateur</label>
                                <select value={adminToRemove} onChange={(e) => setAdminToRemove(e.target.value)}>
                                    <option value=""> -- Sélectionner un administrateur -- </option>
                                    {teachers
                                        .filter((t) => t.administrateur === 1 && t.loginENT !== user)
                                        .map((admin) => (
                                            <option key={admin.loginENT} value={admin.loginENT}>
                                                {admin.nom.toUpperCase()} {admin.prenom} ({admin.loginENT})
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <button
                                onClick={handleRemoveAdmin}
                                className="validate-btn settings-input-margin-fix"
                                style={{ backgroundColor: "var(--error-color)", color: "white", border: "none" }}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "subject" && (
                    <div
                        className="layout-container"
                        style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "-webkit-fill-available", margin: "10px" }}
                    >
                        <SubjectModal
                            isOpen={isSubjectModalOpen}
                            onClose={() => {
                                setIsSubjectModalOpen(false);
                                setEditingSubject(null);
                            }}
                            onSubmit={handleSaveSubject}
                            initialData={editingSubject}
                            defaultValues={{ promo: filterPromo, semester: filterSemester }}
                            promotions={promotions}
                            isLoading={isSubjectLoading}
                        />

                        <div className="filter-container">
                            <div className="Card cols-2 settings-filter-card">
                                <div className="input-group">
                                    <select value={filterPromo} onChange={(e) => setFilterPromo(e.target.value)}>
                                        <option value="">Toutes les promotions</option>
                                        {promotions.map((p) => (
                                            <option key={p} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
                                        <option value="">Tous les semestres</option>
                                        <option value="Impair">Impair</option>
                                        <option value="Pair">Pair</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="settings-card-subtitle-container">
                                <h3 className="settings-card-subtitle">Matières enregistrées</h3>
                                <button onClick={() => setIsSubjectModalOpen(true)} className="validate-btn settings-input-margin-fix">
                                    Ajouter une matière
                                </button>
                            </div>
                            <div className="settings-grid">
                                {filteredSubjects.length === 0 ? (
                                    <p style={{ textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>Aucune matière trouvée.</p>
                                ) : (
                                    filteredSubjects.map((sub) => (
                                        <div key={sub.code} className="settings-list-item">
                                            <div style={{ flex: 1 }}>
                                                <div className="settings-item-info">{sub.libelle}</div>
                                                <div className="settings-item-details">
                                                    {sub.promo} • Semestre {sub.spair === 1 ? "Pair" : "Impair"}
                                                </div>
                                            </div>
                                            <div className="settings-item-actions">
                                                <button onClick={() => handleEditSubject(sub)} className="settings-icon-button" title="Modifier">
                                                    <span className="icon settings-icon icon-edit icon-xl" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteSubject(sub.code)}
                                                    className="settings-icon-button"
                                                    title="Supprimer"
                                                    disabled={deletingSubjectId === sub.code}
                                                >
                                                    {deletingSubjectId === sub.code ? (
                                                        <CustomLoader />
                                                    ) : (
                                                        <span className="icon settings-icon icon-trash icon-xl" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {activeTab === "rse" && (
                    <div
                        className="layout-container"
                        style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "-webkit-fill-available", margin: "10px" }}
                    >
                        <RSEModal
                            isOpen={isRSEModalOpen}
                            onClose={() => {
                                setIsRSEModalOpen(false);
                                setEditingRSE(null);
                            }}
                            onSubmit={handleSaveRSE}
                            initialData={editingRSE}
                            isLoading={isRSELoading}
                        />

                        <div>
                            <div className="settings-card-subtitle-container">
                                <h3 className="settings-card-subtitle">RSE enregistrés</h3>
                                <button onClick={() => setIsRSEModalOpen(true)} className="validate-btn settings-input-margin-fix">
                                    Ajouter un RSE
                                </button>
                            </div>
                            <div className="settings-grid">
                                {rses.length === 0 ? (
                                    <p style={{ textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>Aucun RSE trouvé.</p>
                                ) : (
                                    rses.map((rse) => (
                                        <div key={rse.code} className="settings-list-item">
                                            <div style={{ flex: 1 }}>
                                                <div className="settings-item-info">{rse.libelle}</div>
                                            </div>
                                            <div className="settings-item-actions">
                                                <button onClick={() => handleEditRSE(rse)} className="settings-icon-button" title="Modifier">
                                                    <span className="icon settings-icon icon-edit icon-xl" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteRSE(rse.code)}
                                                    className="settings-icon-button"
                                                    title="Supprimer"
                                                    disabled={deletingRSEId === rse.code}
                                                >
                                                    {deletingRSEId === rse.code ? <CustomLoader /> : <span className="icon settings-icon icon-trash icon-xl" />}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "database" && (
                    <div className="admin-settings">
                        <div className="Card cols-2 settings-db-export-card">
                            <h2>Sauvegardes & Exports</h2>
                            <div className="settings-db-export-list-big">
                                <div className="settings-db-export-list">
                                    <button
                                        onClick={() =>
                                            handleDatabaseExport(
                                                "/database/xlsx-tables",
                                                "tables_backup.xlsx",
                                                "Fichier Excel multi-feuilles téléchargé.",
                                                setIsExportXLSXLoading,
                                            )
                                        }
                                        className="validate-btn settings-input-margin-fix"
                                        disabled={isExportXLSXLoading}
                                    >
                                        {isExportXLSXLoading ? <CustomLoader /> : "Exporter structure + données (.xlsx)"}
                                    </button>

                                    <button
                                        onClick={handleExportRSE}
                                        className="validate-btn settings-input-margin-fix"
                                        disabled={isExportRSELoading}
                                    >
                                        {isExportRSELoading ? <CustomLoader /> : "Exporter RSE (.xlsx)"}
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDatabaseExport(
                                                "/database/dump",
                                                "backup_complete.sql",
                                                "Base de données complète exportée.",
                                                setIsBackUpSQLLoading,
                                            )
                                        }
                                        className="validate-btn settings-input-margin-fix"
                                        disabled={isBackUpSQLLoading}
                                    >
                                        {isBackUpSQLLoading ? <CustomLoader /> : "Exporter structure + données (.sql)"}
                                    </button>

                                    <button
                                        onClick={() => handleDatabaseExport("/database/raw", "appAbsences.db", "Fichier .db téléchargé.", setIsBackUpDBLoading)}
                                        className="validate-btn settings-input-margin-fix"
                                        disabled={isBackUpDBLoading}
                                    >
                                        {isBackUpDBLoading ? <CustomLoader /> : "Exporter structure + données (.db)"}
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDatabaseExport(
                                                "/database/schema",
                                                "schema_structure.sql",
                                                "Structure téléchargée.",
                                                setisSchemaStructureLoading,
                                            )
                                        }
                                        className="validate-btn settings-input-margin-fix"
                                        disabled={isSchemaStructureLoading}
                                    >
                                        {isSchemaStructureLoading ? <CustomLoader /> : "Exporter structure (.sql)"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="Card cols-2 settings-db-justif-card">
                            <h2>Gestion des Justificatifs</h2>
                            <div className="input-group">
                                <label>Année Scolaire (Début Septembre)</label>
                                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                    <option value="">-- Sélectionner une année --</option>
                                    {years.map((y) => (
                                        <option key={y.year} value={y.year}>
                                            Année {y.year} - {parseInt(y.year) + 1} ({formatBytes(y.size)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="settings-db-actions-row">
                                <button
                                    onClick={() => handleDownloadJustifications(true)}
                                    className="validate-btn settings-input-margin-fix settings-btn-full"
                                    disabled={!selectedYear || isDownloadYearJustifLoading}
                                >
                                    {isDownloadYearJustifLoading ? <CustomLoader /> : "Télécharger l'année (ZIP)"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteYearJustifications}
                                    className="validate-btn settings-input-margin-fix settings-btn-full settings-btn-danger"
                                    disabled={!selectedYear || isDeleteYearJustifLoading}
                                >
                                    {isDeleteYearJustifLoading ? <CustomLoader /> : "Supprimer l'année"}
                                </button>
                            </div>

                            <hr className="settings-db-separator" />

                            <h3 className="settings-db-subtitle">Actions Globales</h3>

                            <div className="settings-db-info-text">
                                Stockage total utilisé : <strong>{formatBytes(totalSize)}</strong>
                            </div>

                            <div className="settings-db-actions-row global">
                                <button
                                    onClick={() => handleDownloadJustifications(false)}
                                    className="validate-btn settings-input-margin-fix settings-btn-full"
                                    disabled={isDownloadAllJustifLoading}
                                >
                                    {isDownloadAllJustifLoading ? <CustomLoader /> : "Télécharger Tout (ZIP)"}
                                </button>
                                <button
                                    onClick={handleDeleteJustifications}
                                    className="validate-btn settings-input-margin-fix settings-btn-full settings-btn-danger"
                                    disabled={isDeleteAllJustifLoading}
                                >
                                    {isDeleteAllJustifLoading ? <CustomLoader /> : "Supprimer Tout"}
                                </button>
                            </div>
                        </div>

                        <DatabaseResetCard
                            onExportDump={() => handleDatabaseExport("/database/dump", "backup_complete.sql", "Sauvegarde effectuée.", () => {})}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default SettingsPage;
