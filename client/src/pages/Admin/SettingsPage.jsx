import React, { useState, useEffect } from "react";
import PageTitle from "../../components/common/PageTitle";
import "../../style/Admin.css";
import "../../style/icon.css";
import "../../style/Student.css";
import "../../style/SelectGroups.css";
import "../../style/SettingsPage.css";
import { alertConfirm } from "../../hooks/alertConfirm";
import toast from "react-hot-toast";

function SettingsPage() {
    const [activeTab, setActiveTab] = useState("admin");
    const [adminLogin, setAdminLogin] = useState("");
    const [teachers, setTeachers] = useState([]);
    const [subjectLabel, setSubjectLabel] = useState("");
    const [promotion, setPromotion] = useState("");
    const [semester, setSemester] = useState("");
    const [promotions, setPromotions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [editingSubject, setEditingSubject] = useState(null);
    const [filterPromo, setFilterPromo] = useState("");
    const [filterSemester, setFilterSemester] = useState("");


    const fetchSubjects = async () => {
        try {
            const response = await fetch("http://localhost:3000/subject", { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des matières:", error);
        }
    };

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await fetch("http://localhost:3000/groups/promo", { credentials: "include" });
                if (response.ok) {
                    const data = await response.json();
                    setPromotions(data.map(item => item.promo).sort());
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des promos:", error);
                setPromotions(["L2", "L3", "M1", "M2"]);
            }
        };

        const fetchTeachers = async () => {
            try {
                const response = await fetch("http://localhost:3000/teacher/all", { credentials: "include" });
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
    }, []);

    const handleAddAdmin = async () => {
        if (!adminLogin.trim()) {
            toast.error("Veuillez sélectionner un enseignant.");
            return;
        }

        const { isConfirmed } = await alertConfirm(
            "Êtes-vous sûr ?", 
            `Voulez-vous vraiment ajouter ${adminLogin} en tant qu'administrateur ?`
        );

        if (isConfirmed) {
            toast.success(`Administrateur ${adminLogin} ajouté avec succès !`);
            setAdminLogin("");
        }
    };

    const handleAddSubject = async () => {
        if (!subjectLabel || !promotion || !semester) {
            toast.error("Veuillez remplir tous les champs.");
            return;
        }

        const spairValue = semester === "Pair" ? 1 : 0;

        try {
            if (editingSubject) {
                const response = await fetch(`http://localhost:3000/subject/${editingSubject.code}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        libelle: subjectLabel,
                        promo: promotion,
                        spair: spairValue
                    }),
                    credentials: "include"
                });

                if (response.ok) {
                    toast.success("Matière modifiée avec succès !");
                    setEditingSubject(null);
                    fetchSubjects();
                } else {
                    toast.error("Erreur lors de la modification.");
                }
            } else {
                const response = await fetch("http://localhost:3000/subject/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        libelle: subjectLabel,
                        promo: promotion,
                        spair: spairValue
                    }),
                    credentials: "include"
                });

                if (response.ok) {
                    toast.success("Matière ajoutée avec succès !");
                    fetchSubjects();
                } else {
                    toast.error("Erreur lors de l'ajout.");
                }
            }
            
            setSubjectLabel("");
            setPromotion("");
            setSemester("");
        } catch (err) {
            console.error(err);
            toast.error("Erreur de communication avec le serveur.");
        }
    };

    const handleEditSubject = (subject) => {
        setSubjectLabel(subject.libelle);
        setPromotion(subject.promo);
        setSemester(subject.spair === 1 ? "Pair" : "Impair");
        setEditingSubject(subject);
    };

    const handleCancelEdit = () => {
        setSubjectLabel("");
        setPromotion("");
        setSemester("");
        setEditingSubject(null);
    };

    const handleDeleteSubject = async (id) => {
        const { isConfirmed } = await alertConfirm(
            "Supprimer la matière ?", 
            "Cette action est irréversible."
        );
        if(isConfirmed) {
            try {
                const response = await fetch(`http://localhost:3000/subject/${id}`, {
                    method: "DELETE",
                    credentials: "include"
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
            }
        }
    };

    const filteredSubjects = subjects.filter(sub => {
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
            <PageTitle title="Paramètres" icon="icon-settings" />
            
            <div className="adding-container">
                <div className="dashboard-tabs">
                    <button 
                        className={`dashboard-tab ${activeTab === "admin" ? "active" : ""}`} 
                        onClick={() => setActiveTab("admin")}
                    >
                        <span className="tab-dot"></span>
                        Administrateurs
                    </button>
                    <button 
                        className={`dashboard-tab ${activeTab === "subject" ? "active" : ""}`} 
                        onClick={() => setActiveTab("subject")}
                    >
                        <span className="tab-dot"></span>
                        Matières
                    </button>
                </div>
            </div>

            <div className="content-container">
                
                {activeTab === "admin" && (
                     <div className="Card cols-2">
                        <h2>Ajouter un administrateur</h2>
                        
                        <div className="input-group">
                            <label>Login ENT</label>
                            <select 
                                value={adminLogin}
                                onChange={(e) => setAdminLogin(e.target.value)}
                            >
                                <option value=""> -- Sélectionner un enseignant -- </option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.loginENT} value={teacher.loginENT}>
                                        {teacher.nom.toUpperCase()} {teacher.prenom} ({teacher.loginENT})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button 
                            onClick={handleAddAdmin}
                            className="validate-btn settings-input-margin-fix"
                        >
                            Ajouter l'administrateur
                        </button>
                    </div>
                )}

                {activeTab === "subject" && (
                    <div className="settings-subject-container">
                        <div className="Card cols-3" style={{ marginBottom: '2rem' }}>
                            <h2>
                                {editingSubject ? "Modifier une matière" : "Ajouter une matière"}
                            </h2>
                            
                            <div className="input-group">
                                <label>Libellé de la matière</label>
                                <input 
                                    type="text" 
                                    placeholder="Analyse syntaxique, Système..."
                                    value={subjectLabel}
                                    onChange={(e) => setSubjectLabel(e.target.value)}
                                />
                            </div>

                             <div className="input-group">
                                <label>Promotion</label>
                                <select 
                                    value={promotion}
                                    onChange={(e) => setPromotion(e.target.value)}
                                >
                                    <option value="">-- Sélectionner une promotion --</option>
                                    {promotions.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                             <div className="input-group">
                                <label>Semestre</label>
                                <select 
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                >
                                    <option value="">-- Sélectionner le semestre --</option>
                                    <option value="Impair">Impair</option>
                                    <option value="Pair">Pair</option>
                                </select>
                            </div>

                            <div className="settings-btn-group">
                                <button 
                                    onClick={handleAddSubject}
                                    className="validate-btn settings-btn-action"
                                >
                                    {editingSubject ? "Modifier" : "Ajouter"}
                                </button>
                                {editingSubject && (
                                     <button 
                                        onClick={handleCancelEdit}
                                        className="validate-btn settings-btn-cancel"
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </div>

                         <h3 className="settings-card-subtitle">Matières enregistrées</h3>
                         
                         <div className="Card cols-2 settings-filter-card">
                             <div className="input-group">
                                 <select 
                                    value={filterPromo}
                                    onChange={(e) => setFilterPromo(e.target.value)}
                                >
                                    <option value="">Toutes les promotions</option>
                                    {promotions.map(p => <option key={p} value={p}>{p}</option>)}
                                 </select>
                             </div>

                             <div className="input-group">
                                 <select 
                                    value={filterSemester}
                                    onChange={(e) => setFilterSemester(e.target.value)}
                                >
                                    <option value="">Tous les semestres</option>
                                    <option value="Impair">Impair</option>
                                    <option value="Pair">Pair</option>
                                </select>
                             </div>
                         </div>

                         <div className="settings-list-container">
                            {filteredSubjects.length === 0 ? (
                                <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Aucune matière trouvée.</p>
                            ) : (
                                filteredSubjects.map(sub => (
                                    <div key={sub.code} className="settings-list-item">
                                        <div style={{ flex: 1 }}>
                                            <div className="settings-item-info">{sub.libelle}</div>
                                            <div className="settings-item-details">{sub.promo} • Semestre {sub.spair === 1 ? "Pair" : "Impair"}</div>
                                        </div>
                                        <div className="settings-item-actions">
                                            <button 
                                                onClick={() => handleEditSubject(sub)}
                                                className="settings-icon-button"
                                                title="Modifier"
                                            >
                                                <span className="icon settings-icon icon-edit" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteSubject(sub.code)}
                                                className="settings-icon-button"
                                                title="Supprimer"
                                            >
                                                <span className="icon settings-icon icon-trash" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                         </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default SettingsPage;
