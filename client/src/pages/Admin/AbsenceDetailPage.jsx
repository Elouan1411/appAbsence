import { API_URL } from "../../config";
import React, { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import InputField from "../../components/common/InputField";
import ModificationAbsence from "../../components/AbsenceDetail/ModificationAbsence";
import Footer from "../../components/StudentDetailPage/Footer";
import { alertConfirm } from "../../hooks/alertConfirm";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import { useUnsaved } from "../../context/UnsavedContext";
import "../../style/StudentDetail.css";
import JustificationAbsence from "../../components/AbsenceDetail/JustificationAbsence";
import { motif_translation } from "../../constants/motif_translation";
import firstCharUppercase from "../../functions/firstCharUppercase";
import BackButton from "../../components/common/BackButton";
import NavigateBackButton from "../../components/common/NavigateBackButton";

function AbsenceDetailPage() {
    const { absenceId } = useParams();
    const [debut, setDebut] = useState(0);
    const [fin, setFin] = useState(0);
    const [numeroEtudiant, setNumeroEtudiant] = useState(0);
    const [loginEtudiant, setLoginEtudiant] = useState("");
    const [groupeTD, setGroupeTD] = useState("");
    const [groupeTP, setGroupeTP] = useState("");
    const [promo, setPromo] = useState("");
    const [loginProfesseur, setLoginProfesseur] = useState(0);
    const [matiere, setMatiere] = useState(0);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isJustified, setJustified] = useState(false);
    const [justification, setJustification] = useState([]);

    const [oldDebut, setOldDebut] = useState(0);
    const [oldFin, setOldFin] = useState(0);
    const [oldNumeroEtudiant, setOldNumeroEtudiant] = useState(0);
    const [oldLoginProfesseur, setOldLoginProfesseur] = useState(0);
    const [oldMatiere, setOldMatiere] = useState(0);

    const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    const handleGoBack = () => {
        safeNavigate(-1);
    };

    useEffect(() => {
        handleFetchJustification();
    }, [isJustified]);

    useEffect(() => {
        if (debut != oldDebut || fin != oldFin || numeroEtudiant != oldNumeroEtudiant || oldMatiere != matiere || loginProfesseur != oldLoginProfesseur) {
            setHasUnsavedChanges(true);
        }
    }, [debut, fin, numeroEtudiant, loginProfesseur, matiere]);
    const handleFetchAbsence = async () => {
        try {
            const result = await fetch(`${API_URL}/absence/detail/` + absenceId, {
                method: "GET",
                credentials: "include",
            });
            const data = await result.json();
            console.log(data);

            if (data && data.length > 0) {
                setDebut(data[0].debut || 0);
                setFin(data[0].fin || 0);
                setNumeroEtudiant(data[0].numeroEtudiant || "");
                setLoginProfesseur(data[0].loginProfesseur || "");
                setMatiere(data[0].codeMatiere || 0);
                setJustified(data[0].justifie == 1);
                setOldDebut(data[0].debut || 0);
                setOldFin(data[0].fin || 0);
                setOldNumeroEtudiant(data[0].numeroEtudiant || "");
                setOldLoginProfesseur(data[0].loginProfesseur || "");
                setOldMatiere(data[0].codeMatiere || 0);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Erreur récupération absence");
        }
    };

    const handleFetchJustification = async () => {
        try {
            const result = await fetch(`${API_URL}/justification/absence/` + absenceId, {
                method: "GET",
                credentials: "include",
            });
            const data = await result.json();
            const item = data[0];
            console.log(item.liste_creneaux);
            if (item.liste_creneaux && item.liste_creneaux.length > 0) {
                let new_creneaux = JSON.parse(item.liste_creneaux);
                const sortedByStart = [...new_creneaux].sort((a, b) => new Date(a.debut) - new Date(b.debut));

                const sortedByEnd = [...new_creneaux].sort((a, b) => new Date(b.fin) - new Date(a.fin));

                const subMotif = item.motif.split("|");
                const motifTitle = motif_translation[subMotif[0].trim()] || subMotif[0].trim();
                const commentaire = firstCharUppercase(subMotif[1] || "").trim() || "";

                let newItem = {
                    ...item,
                    debut: sortedByStart[0].debut,
                    fin: sortedByEnd[0].fin,
                    liste_creneaux: new_creneaux,
                    motif: motifTitle,
                    commentaire: commentaire,
                };
                console.log(newItem);

                setJustification(newItem);
            }
        } catch (err) {
            console.error(err);
        }
    };
    const handleCancelChanges = async () => {
        const result = await alertConfirm("Voulez-vous annuler vos changements ?");
        if (result.isConfirmed) {
            setDebut(oldDebut);
            setFin(oldFin);
            setNumeroEtudiant(oldNumeroEtudiant);
            setLoginProfesseur(oldLoginProfesseur);
            setMatiere(oldMatiere);
            setEditing(false);
        }
    };

    const handleDeleteAbsence = async () => {
        console.log(idAbsence);
        const confirmation = await alertConfirm("Voulez-vous supprimer cette absence ?");
        if (confirmation.isConfirmed) {
            try {
                const result = await fetch(`${API_URL}/absence/` + absenceId, {
                    method: "DELETE",
                    credentials: "include",
                });
                const data = await result.json();
                toast.success(data);
                handleGoBack();
            } catch (err) {
                toast.error(err);
            }
        }
    };

    const handleSaveChanges = async () => {
        const confirm = await alertConfirm("Voulez-vous sauvegarder vos changements ?", "Ces changements seront irréversibles.");
        if (confirm.isConfirmed) {
            if (loginProfesseur != oldLoginProfesseur || matiere != oldMatiere || debut != oldDebut || fin != oldFin) {
                try {
                    const result = await fetch(`${API_URL}/appel/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            start: debut,
                            end: fin,
                            loginProf: loginProfesseur,
                            code: matiere,
                            promo: promo,
                            groupeTD: groupeTD,
                            groupeTP: groupeTP,
                        }),
                    });

                    const data = await result.json();
                    const appelId = data.id;

                    const absenceResult = await fetch(`${API_URL}/absence/modifyAppel/` + absenceId, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ newAppelId: appelId }),
                    });
                } catch (err) {
                    toast.error(err);
                }
            }
            if (oldNumeroEtudiant != numeroEtudiant) {
                try {
                    const result = await fetch(`${API_URL}/absence/` + absenceId, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ newNumeroEtudiant: numeroEtudiant, newLoginENT: loginEtudiant }),
                    });
                } catch (err) {
                    toast.error(err);
                }
            }
            toast.success("Les changements ont été effectués avec succès.");
            handleGoBack();
        }
    };

    useEffect(() => {
        handleFetchAbsence();
    }, [absenceId]);

    return (
        <div className="absence-detail-container">
            <PageTitle title={"Détail de l'absence"} icon={"icon-absences"} />
            <NavigateBackButton />
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
                    setLoginEtudiant={setLoginEtudiant}
                    setPromo={setPromo}
                    setGroupeTD={setGroupeTD}
                    setGroupeTP={setGroupeTP}
                    promo={promo}
                />
                {isJustified && <JustificationAbsence justification={justification} />}
            </div>
            <Footer
                editing={editing}
                setEditing={setEditing}
                handleCancelChanges={handleCancelChanges}
                handleDeleteUser={handleDeleteAbsence}
                handleConfirmModification={handleSaveChanges}
            />
        </div>
    );
}

export default AbsenceDetailPage;
