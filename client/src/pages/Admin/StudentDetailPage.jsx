import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import PageTitle from "../../components/common/PageTitle";
import PersonalInformations from "../../components/StudentDetailPage/PersonalInformations";
import { useUnsaved } from "../../context/UnsavedContext";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import "../../style/StudentDetail.css";

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
};

function StudentDetailPage() {
    const { userId } = useParams();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [student, setStudent] = useState(emptyStudent);

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
                prenom: data[0].prenom,
                nom: data[0].nom,
                numeroEtudiant: data[0].numero,
                loginENT: data[0].loginENT,
                promo: data[0].promo,
                promoPair: data[0].promoPair,
                groupeTD: data[0].groupeTD,
                groupeTDPair: data[0].groupeTDPair,
                groupeTP: data[0].groupeTP,
                groupeTPPair: data[0].groupeTPPair,
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
        setStudent((prev) => ({ ...prev, [field]: value }));
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

    return (
        <div className="student-detail-container">
            <PageTitle title="Détail étudiant" icon="icon-school" />
            <button onClick={toggleEditing}>{editing ? "Sauvegarder" : "Modifier"}</button>

            <PersonalInformations student={student} loading={loading} editing={editing} setEditing={setEditing} onChange={handleChange} />

            <button onClick={handleGoBack}>Revenir en arrière</button>
        </div>
    );
}

export default StudentDetailPage;
