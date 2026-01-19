import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import PageTitle from "../../components/common/PageTitle";
import PersonalInformations from "../../components/StudentDetailPage/PersonalInformations";
import { useUnsaved } from "../../context/UnsavedContext";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import "../../style/StudentDetail.css";
import AbsenceList from "../../components/StudentDetailPage/AbsenceList";
import Footer from "../../components/StudentDetailPage/Footer";
import { alertConfirm } from "../../hooks/alertConfirm";

const emptyStudent = {
    prenom: "",
    nom: "",
    numeroEtudiant: "",
    loginENT: "",
    promo: "",
    promoPair: "",
    groupeTD: "",
    groupeTDPair: "",
    groupeTP: "",
    groupeTPPair: "",
    rse: [],
};

function StudentDetailPage() {
    const { userId } = useParams();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [student, setStudent] = useState(emptyStudent);
    const [newStudent, setNewStudent] = useState(emptyStudent);
    const [absences, setAbsences] = useState([]);

    const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    const fetchStudent = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:3000/eleve/${userId}`, {
                credentials: "include",
            });
            const data = await res.json();
            setStudent({
                prenom: data.prenom,
                nom: data.nom,
                numeroEtudiant: data.numero,
                loginENT: data.loginENT,
                promo: data.promo,
                promoPair: data.promoPair,
                groupeTD: data.groupeTD,
                groupeTDPair: data.groupeTDPair,
                groupeTP: data.groupeTP,
                groupeTPPair: data.groupeTPPair,
                rse: data.rse,
            });

            setNewStudent({
                prenom: data.prenom,
                nom: data.nom,
                numeroEtudiant: data.numero,
                loginENT: data.loginENT,
                promo: data.promo,
                promoPair: data.promoPair,
                groupeTD: data.groupeTD,
                groupeTDPair: data.groupeTDPair,
                groupeTP: data.groupeTP,
                groupeTPPair: data.groupeTPPair,
                rse: data.rse,
            });
        } catch (err) {
            toast.error("Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchStudent();
    }, [fetchStudent]);

    const handleChange = (field, value) => {
        setNewStudent((prev) => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const handleGoBack = () => {
        safeNavigate(-1);
    };

    const toggleEditing = async () => {
        if (!editing) {
            setEditing(true);
            return;
        }

        const result = await alertConfirm("Voulez-vous sauvegarder ?");
        if (result.isConfirmed) {
            setEditing(false);
        }
    };

    const handleCancelChanges = () => {
        console.log("Je clique");
        setNewStudent(student);
        setEditing(false);
    };

    const handleDeleteStudent = async () => {
        const result = await alertConfirm("Voulez-vous supprimer cet étudiant ?", "Cette action est irréversible.");
        if (result.isConfirmed) {
            try {
                const data = await fetch("http://localhost:3000/eleve/" + student.numeroEtudiant, {
                    method: "DELETE",
                    credentials: "include",
                });
                handleGoBack();
            } catch (err) {
                toast.error(err);
            }
        }
    };

    const handleSave = async () => {
        if (JSON.stringify(newStudent) == JSON.stringify(student)) {
            setEditing(false);
            return;
        }
        const result = await alertConfirm("Voulez-vous sauvegarder vos modifications ?", "Vous pourrez les modifier ultérieurement.");
        if (result.isConfirmed) {
            try {
                if (newStudent.numeroEtudiant == student.numeroEtudiant && newStudent.loginENT == student.loginENT) {
                    const data = await fetch("http://localhost:3000/eleve/", {
                        method: "PUT",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newStudent),
                    });

                    if (JSON.stringify(newStudent.rse) != JSON.stringify(student.rse)) {
                        const rseData = await fetch("http://localhost:3000/rse/" + student.numeroEtudiant, {
                            method: "PUT",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ rse: newStudent.rse, newNumeroEtudiant: newStudent.numeroEtudiant }),
                        });
                    }
                } else {
                    const data = await fetch("http://localhost:3000/eleve/" + student.numeroEtudiant, {
                        method: "DELETE",
                        credentials: "include",
                    });

                    const response = await fetch("http://localhost:3000/eleve/add", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify(newStudent),
                    });

                    const allAbsence = await fetch("http://localhost:3000/absence/allID/" + student.numeroEtudiant, {
                        method: "GET",
                        credentials: "include",
                    });

                    const allAbsenceID = await allAbsence.json();

                    allAbsenceID.forEach(async (element) => {
                        const responseAbsence = await fetch("http://localhost:3000/absence/" + element.idAbsence, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({ newNumeroEtudiant: newStudent.numeroEtudiant, newLoginENT: newStudent.loginENT }),
                        });
                    });

                    if (JSON.stringify(newStudent.rse) != JSON.stringify(student.rse)) {
                        const rseData = await fetch("http://localhost:3000/rse/" + student.numeroEtudiant, {
                            method: "PUT",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ rse: student.rse, newNumeroEtudiant: newStudent.numeroEtudiant }),
                        });
                    }

                    setHasUnsavedChanges(false);
                    safeNavigate("/admin/studentDetail/" + newStudent.numeroEtudiant, { replace: true });
                }
                setEditing(false);
                toast.success("Vos modifications ont été enregistrées avec succès!");
            } catch (err) {
                toast.error(err);
            }
        }
    };

    return (
        <div className="student-detail-container">
            <PageTitle title="Détail étudiant" icon="icon-school" />
            <div className="button-container">
                <button onClick={handleGoBack}>
                    <span className="icon icon-previous"></span>
                </button>
            </div>

            <PersonalInformations
                student={newStudent}
                loading={loading}
                editing={editing}
                setEditing={setEditing}
                onChange={handleChange}
                setStudent={(prev) => setNewStudent(prev)}
            />
            <AbsenceList setLoading={setLoading} userId={userId} setAbsences={setAbsences} absences={absences} />
            <Footer
                handleConfirmModification={handleSave}
                handleDeleteUser={handleDeleteStudent}
                setEditing={toggleEditing}
                handleCancelChanges={handleCancelChanges}
                editing={editing}
            />
        </div>
    );
}

export default StudentDetailPage;
