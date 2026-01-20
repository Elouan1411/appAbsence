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
            console.log(data);
            setDebut(data[0].debut);
            setFin(data[0].fin);
            setNumeroEtudiant(data[0].numeroEtudiant);
            setLoginProfesseur(data[0].loginProfesseur);
            setMatiere(data[0].codeMatiere);
        } catch (err) {
            toast.error(err);
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
