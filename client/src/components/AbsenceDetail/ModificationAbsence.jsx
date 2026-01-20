import React, { useEffect, useState } from "react";
import CustomLoader from "../common/CustomLoader";
import InputField from "../common/InputField";
import { alertConfirm } from "../../hooks/alertConfirm";
import toast from "react-hot-toast";

function ModificationAbsence({
    debut,
    setDebut,
    fin,
    setFin,
    matiere,
    setMatiere,
    numeroEtudiant,
    setNumeroEtudiant,
    loginProfesseur,
    setLoginProfesseur,
    editing,
    onChange,
    setAbsence,
    loading,
}) {
    const [prenomEtudiant, setPrenomEtudiant] = useState("");
    const [nomEtudiant, setNomEtudiant] = useState("");

    const [nomProfesseur, setNomProfesseur] = useState("");
    const [prenomProfesseur, setPrenomProfesseur] = useState("");

    const fetchStudentNames = async () => {
        try {
            const result = await fetch("http://localhost:3000/eleve/" + numeroEtudiant, {
                method: "GET",
                credentials: "include",
            });

            const data = await result.json();
            console.log(data);

            if (data && Object.keys(data).length != 0) {
                setPrenomEtudiant(data.prenom);
                setNomEtudiant(data.nom);
            } else {
                setPrenomEtudiant("");
                setNomEtudiant("");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Erreur récupération étudiant");
        }
    };

    useEffect(() => {
        fetchStudentNames();
    }, [numeroEtudiant]);
    if (loading) return <CustomLoader />;

    return (
        <div>
            <div className="subtitle-container">
                <h2>Informations générales</h2>
            </div>

            <div className="personal-info-subcontainer">
                <div className="info-grid-container">
                    <h3>Informations personnelles</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            {/* <span className="label">{label}</span> */}
                            <InputField value={numeroEtudiant} disabled={!editing} onChange={(e) => setNumeroEtudiant(e.target.value)} />
                        </div>
                        <div className="info-item">
                            {/* <span className="label">{label}</span> */}
                            <InputField value={prenomEtudiant} disabled={true} onChange={setPrenomEtudiant} />
                        </div>
                        <div className="info-item">
                            {/* <span className="label">{label}</span> */}
                            <InputField value={nomEtudiant} disabled={true} onChange={setNomEtudiant} />
                        </div>
                    </div>
                </div>

                {/* <div className="info-grid-container">
                    <h3>Cours</h3>
                    <div className="info-grid">
                        {renderInput("Matière", "libelle")}
                        {renderInput("Groupe TD", "groupeTD")}
                        {renderInput("Groupe TP", "groupeTP")}
                    </div>
                </div>

                <div className="info-grid-container">
                    <h3>Semestre Pair</h3>
                    <div className="info-grid">
                        {renderInput("Promo", "promoPair")}
                        {renderInput("Groupe TD", "groupeTDPair")}
                        {renderInput("Groupe TP", "groupeTPPair")}
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default ModificationAbsence;
