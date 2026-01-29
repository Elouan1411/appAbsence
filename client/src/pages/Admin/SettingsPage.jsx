import React, { useState, useEffect } from "react";
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
import { API_URL } from "../../config";
import CustomLoader from "../../components/common/CustomLoader";

function SettingsPage() {
    const [activeTab, setActiveTab] = useState("admin");
    const [adminLogin, setAdminLogin] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);

    const [promotions, setPromotions] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    const [filterPromo, setFilterPromo] = useState("");
    const [filterSemester, setFilterSemester] = useState("");

    const [isSubjectLoading, setIsSubjectLoading] = useState(false);
    const [isAdminLoading, setIsAdminLoading] = useState(false);
    const [deletingSubjectId, setDeletingSubjectId] = useState(null);

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
                setContactEmail(data.contact_email || "");
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
        fetchContactEmail();
    }, []);

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
                                    {teachers.map((teacher) => (
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
                                        color: "var(--text-primary)"
                                    }}
                                />
                            </div>
                            <button onClick={handleSaveEmail} className="validate-btn settings-input-margin-fix" disabled={isEmailLoading}>
                                {isEmailLoading ? <CustomLoader /> : "Sauvegarder"}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "subject" && (
                    <div className="layout-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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
                            <div className="settings-list-container">
                                {filteredSubjects.length === 0 ? (
                                    <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>Aucune matière trouvée.</p>
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
                                                    {deletingSubjectId === sub.code ? <CustomLoader /> : <span className="icon settings-icon icon-trash icon-xl" />}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SettingsPage;
