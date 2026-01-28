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
    const [isSaving, setIsSaving] = useState(false);
    const [isJustified, setJustified] = useState(false);
    const [justification, setJustification] = useState([]);

    const [oldDebut, setOldDebut] = useState(0);
    const [oldFin, setOldFin] = useState(0);
    const [oldNumeroEtudiant, setOldNumeroEtudiant] = useState(0);
    const [oldLoginProfesseur, setOldLoginProfesseur] = useState(0);
    const [oldMatiere, setOldMatiere] = useState(0);

    const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    const [editLoading, setEditLoading] = useState(false);

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
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleFetchJustification = async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
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
        const confirmation = await alertConfirm("Voulez-vous supprimer cette absence ?");
        if (confirmation.isConfirmed) {
            try {
                setIsSaving(true);
                setEditLoading(true);
                const result = await fetch(`${API_URL}/absence/` + absenceId, {
                    method: "DELETE",
                    credentials: "include",
                });
                const data = await result.json();
                toast.success(data);
                handleGoBack();
            } catch (err) {
                toast.error(err);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleSaveChanges = async () => {
        const confirm = await alertConfirm("Voulez-vous sauvegarder vos changements ?", "Ces changements seront irréversibles.");
        if (confirm.isConfirmed) {
            try {
                setIsSaving(true);
                setEditLoading(true);
                if (loginProfesseur != oldLoginProfesseur || matiere != oldMatiere || debut != oldDebut || fin != oldFin) {
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
                }
                if (oldNumeroEtudiant != numeroEtudiant) {
                    const result = await fetch(`${API_URL}/absence/` + absenceId, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ newNumeroEtudiant: numeroEtudiant, newLoginENT: loginEtudiant }),
                    });
                }
                toast.success("Les changements ont été effectués avec succès.");
                handleGoBack();
            } catch (err) {
                toast.error(err);
            } finally {
                setIsSaving(false);
            }
        }
    };

    useEffect(() => {
        handleFetchAbsence();
    }, [absenceId]);

    return (
        <div className="absence-detail-container">
            <PageTitle title={"Détail de l'absence"} icon={"icon-absences"} />
            <NavigateBackButton />
            
            {loading ? <CustomLoader /> : (
                <>
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
                isLoading={isSaving}
            />
            </>
            )}
            
        </div>
    );
}

export default AbsenceDetailPage;
