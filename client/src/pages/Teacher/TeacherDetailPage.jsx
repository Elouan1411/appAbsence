import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { API_URL } from "../../config";
import PageTitle from "../../components/common/PageTitle";
import toast from "react-hot-toast";
import { useTheme } from "../../hooks/useTheme";
import { alertConfirm } from "../../hooks/alertConfirm";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import CustomLoader from "../../components/common/CustomLoader";
import "../../style/Admin.css";
import "../../style/Teacher.css";
import "../../style/StudentDetail.css"; 

function TeacherDetailPage() {
    const { loginENT } = useParams();
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const theme = useTheme();

    const [teacher, setTeacher] = useState({
        loginENT: "",
        nom: "",
        prenom: "",
    });
    const [originalTeacher, setOriginalTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/teacher/${loginENT}`, {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setTeacher(data[0]);
                        setOriginalTeacher(data[0]);
                    } else {
                        toast.error("Enseignant non trouvé");
                        navigate("/admin/listes");
                    }
                } else {
                    toast.error("Erreur lors du chargement");
                    navigate("/admin/listes");
                }
            } catch (error) {
                console.error("Error fetching teacher:", error);
                toast.error("Erreur réseau");
            } finally {
                setLoading(false);
            }
        };

        if (loginENT) {
            fetchTeacher();
        }
    }, [loginENT, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTeacher((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch(`${API_URL}/teacher/${loginENT}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nom: teacher.nom,
                    prenom: teacher.prenom,
                }),
                credentials: "include",
            });

            if (response.ok) {
                toast.success("Mise à jour réussie");
                setOriginalTeacher(teacher);
                navigate("/admin/listes");
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Erreur lors de la mise à jour");
            }
        } catch (error) {
            console.error("Error updating teacher:", error);
            toast.error("Erreur réseau");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
         if (await alertConfirm("Êtes-vous sûr ?", `Supprimer l'enseignant ${teacher.prenom} ${teacher.nom} ?`)) {
             try {
                 const response = await fetch(`${API_URL}/teacher/${loginENT}`, {
                     method: "DELETE",
                     credentials: "include",
                 });

                 if (response.ok) {
                     toast.success("Enseignant supprimé");
                     navigate("/admin/listes");
                 } else {
                     const errorData = await response.json();
                     toast.error(errorData.error || "Erreur lors de la suppression");
                 }
             } catch (error) {
                 console.error("Error deleting teacher:", error);
                 toast.error("Erreur réseau");
             }
         }
    };

    if (loading) {
        return <div className="loading"><CustomLoader /></div>;
    }

    return (
        <div className="student-detail-container">
            <PageTitle title={"Modifier l'enseignant"} icon="icon-student-list" canGoBack={true} />
            
            <div className="scrollable-content">
                <div className="personal-info-container">
                    <div className="personal-info-subcontainer">
                         <div className="info-grid-container">
                            <h3>Informations générales</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <InputField 
                                        text="Identifiant ENT"
                                        value={teacher.loginENT} 
                                        disabled={true}
                                    />
                                </div>
                                <div className="info-item">
                                    <InputField 
                                        text="Nom"
                                        name="nom"
                                        value={teacher.nom} 
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="info-item">
                                    <InputField 
                                        text="Prénom"
                                        name="prenom"
                                        value={teacher.prenom} 
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-container">
                {saving ? (
                    <CustomLoader />
                ) : (
                    <>
                        <Button onClick={handleDelete} className="delete-student-button">
                            <span>Supprimer</span>
                        </Button>
                        <Button onClick={handleSave} className="save-student-button">
                            <span>Enregistrer</span>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export default TeacherDetailPage;
