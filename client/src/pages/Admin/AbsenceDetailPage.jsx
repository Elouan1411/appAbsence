import React, { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import InputField from "../../components/common/InputField";
import ModificationAbsence from "../../components/AbsenceDetail/ModificationAbsence";

function AbsenceDetailPage() {
    const { absenceId } = useParams();
    const [debut, setDebut] = useState(0);
    const [fin, setFin] = useState(0);
    const [numeroEtudiant, setNumeroEtudiant] = useState(0);
    const [loginProfesseur, setLoginProfesseur] = useState(0);
    const [matiere, setMatiere] = useState(0);
    const [editing, setEditing] = useState(false);

    const [loading, setLoading] = useState(false);
    const handleFetchAbsence = async () => {
        try {
            const result = await fetch("http://localhost:3000/absence/detail/" + absenceId, {
                method: "GET",
                credentials: "include",
            });
            const data = await result.json();

            if (data && data.length > 0) {
                setDebut(data[0].debut || 0);
                setFin(data[0].fin || 0);
                setNumeroEtudiant(data[0].numeroEtudiant || "");
                setLoginProfesseur(data[0].loginProfesseur || "");
                setMatiere(data[0].codeMatiere || 0);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Erreur récupération absence");
        }
    };
    const handleChange = (field, value) => {
        setNewStudent((prev) => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    useEffect(() => {
        handleFetchAbsence();
    }, [absenceId]);
    return (
        <div className="absence-detail-container">
            <PageTitle title={"Détail de l'absence"} icon={"icon-absences"} />
            <h3>Modifier l'absence de</h3>
            <button onClick={() => setEditing(!editing)}>editing</button>
            <div className="absence-detail">
                <ModificationAbsence
                    debut={debut}
                    setDebut={setDebut}
                    fin={fin}
                    setFin={setFin}
                    numeroEtudiant={numeroEtudiant}
                    setNumeroEtudiant={setNumeroEtudiant}
                    setLoginProfesseur={setLoginProfesseur}
                    loginProfesseur={loginProfesseur}
                    loading={loading}
                    setMatiere={setMatiere}
                    matiere={matiere}
                    editing={editing}
                />
            </div>
        </div>
    );
}

export default AbsenceDetailPage;
