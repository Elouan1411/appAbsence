import React, { use, useEffect, useState } from "react";
import CustomLoader from "../common/CustomLoader";
import InputField from "../common/InputField";
import { alertConfirm } from "../../hooks/alertConfirm";
import toast from "react-hot-toast";
import "../../style/AbsenceDetail.css";
import SelectSubject from "../Teacher/SelectSubject";
import SelectTime from "../Teacher/SelectTime";
import { DateObjectToInt, IntToDateObject, semesterParity } from "../../functions/dateFormatter";
import SelectGroup from "../Teacher/SelectGroup";
import { API_URL } from "../../config";

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
    setLoginEtudiant,
    loading,
    promo,
    setPromo,
    setGroupeTD,
    setGroupeTP,
}) {
    const [prenomEtudiant, setPrenomEtudiant] = useState("");
    const [nomEtudiant, setNomEtudiant] = useState("");
    const [studentSuggestions, setStudentSuggestions] = useState([]);
    const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);

    const [nomProfesseur, setNomProfesseur] = useState("");
    const [prenomProfesseur, setPrenomProfesseur] = useState("");
    const [teacherSuggestions, setTeacherSuggestions] = useState([]);
    const [showTeacherSuggestions, setShowTeacherSuggestions] = useState(false);

    const [pair, setPair] = useState(semesterParity(debut));

    const [dateValue, setDateValue] = useState(IntToDateObject(debut, fin));
    const [hasUpdatedDate, setHasUpdatedDate] = useState(false);

    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        if (!hasUpdatedDate) {
            if (debut === 0 || fin === 0) return;

            const currentInts = DateObjectToInt(dateValue);

            if (currentInts.debut === debut && currentInts.fin === fin) {
                return;
            }

            setDateValue(IntToDateObject(debut, fin));
            setHasUpdatedDate(true);
        }
    }, [debut, fin, dateValue]);

    const handleDateChange = (newValue) => {
        setDateValue(newValue);

        const dateInts = DateObjectToInt(newValue);

        if (dateInts.debut !== debut || dateInts.fin !== fin) {
            setDebut(dateInts.debut);
            setFin(dateInts.fin);
            setPair(semesterParity(dateInts.debut));
        }
    };

    const fetchStudentNames = async () => {
        try {
            setLoading(true);
            const result = await fetch(`${API_URL}/eleve/` + numeroEtudiant, {
                method: "GET",
                credentials: "include",
            });

            const data = await result.json();
            if (data && Object.keys(data).length !== 0 && !data.error) {
                setPrenomEtudiant(data.prenom);
                setNomEtudiant(data.nom);
                setPromo(data.promo);
                setGroupeTD(data.groupeTD);
                setGroupeTP(data.groupeTP);
                setLoginEtudiant(data.loginENT);
            } else {
                setPrenomEtudiant("");
                setNomEtudiant("");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Erreur récupération étudiant");
        } finally {
            setLoading(false);
        }
    };

    const fetchTeacherNames = async () => {
        try {
            setLoading(true);
            const result = await fetch(`${API_URL}/teacher/` + loginProfesseur, {
                method: "GET",
                credentials: "include",
            });

            const temp = await result.json();
            const data = temp[0];

            if (data && Object.keys(data).length !== 0 && !data.error) {
                setPrenomProfesseur(data.prenom);
                setNomProfesseur(data.nom);
            } else {
                setPrenomProfesseur("");
                setNomProfesseur("");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Erreur récupération enseignant");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setNumeroEtudiant(value);

        if (value.length > 1) {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/eleve/search?q=${value}`, {
                    credentials: "include",
                });
                const data = await response.json();
                setStudentSuggestions(data);
                setShowStudentSuggestions(true);
                setShowTeacherSuggestions(false);
            } catch (error) {
                console.error("Erreur recherche", error);
                setStudentSuggestions([]);
            } finally {
                setLoading(false);
            }
        } else {
            setStudentSuggestions([]);
            setShowStudentSuggestions(false);
        }
    };

    const handleTeacherInputChange = async (e) => {
        const value = e.target.value;
        setLoginProfesseur(value);

        if (value.length > 1) {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/teacher/search?q=${value}`, {
                    credentials: "include",
                });
                const data = await response.json();
                setTeacherSuggestions(data);
                setShowTeacherSuggestions(true);
                setShowStudentSuggestions(false);
            } catch (error) {
                console.error("Erreur recherche", error);
                setTeacherSuggestions([]);
            } finally {
                setLoading(false);
            }
        } else {
            setTeacherSuggestions([]);
            setShowTeacherSuggestions(false);
        }
    };

    const handleSelectSuggestion = (student) => {
        setNumeroEtudiant(student.numero);
        setPrenomEtudiant(student.prenom);
        setNomEtudiant(student.nom);
        setLoginEtudiant(student.loginENT);
        setGroupeTD(student.groupeTD);
        setGroupeTP(student.groupeTP);
        setStudentSuggestions([]);
        setShowStudentSuggestions(false);
    };

    const handleSelectTeacherSuggestion = (teacher) => {
        setLoginProfesseur(teacher.loginENT);
        setPrenomProfesseur(teacher.prenom);
        setNomProfesseur(teacher.nom);
        setTeacherSuggestions([]);
        setShowTeacherSuggestions(false);
    };

    useEffect(() => {
        if (numeroEtudiant && !showStudentSuggestions) {
            fetchStudentNames();
        }
    }, [numeroEtudiant]);

    useEffect(() => {
        if (loginProfesseur && !showTeacherSuggestions) {
            fetchTeacherNames();
        }
    }, [loginProfesseur]);

    return (
        <div>
            {loading ? (
                <CustomLoader />
            ) : (
                <>
                    <div className="subtitle-container">
                        <h2>Informations générales</h2>
                    </div>

                    <div className="personal-info-subcontainer">
                        <div className="info-grid-container">
                            <h3>Etudiant concerné</h3>
                            <div className="info-grid">
                                <div className={"info-item autocomplete-container " + `${showStudentSuggestions ? "active" : ""}`}>
                                    <span className="label">Numéro Etudiant</span>
                                    <InputField
                                        value={numeroEtudiant}
                                        disabled={!editing}
                                        onChange={handleInputChange}
                                        onBlur={() => setTimeout(() => setShowStudentSuggestions(false), 200)}
                                        autoComplete="off"
                                    />

                                    {editing && showStudentSuggestions && studentSuggestions.length > 0 && (
                                        <ul className="suggestions-list">
                                            {studentSuggestions.map((student, index) => (
                                                <li key={index} onMouseDown={() => handleSelectSuggestion(student)} className="suggestion-item">
                                                    <span className="suggestion-number">{student.numero}</span>

                                                    <div className="suggestion-preview">
                                                        <span>
                                                            <strong>
                                                                {student.prenom} {student.nom}
                                                            </strong>
                                                            {` (${student.promo})` || " (N/A)"}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="info-item">
                                    <span className="label">Prénom</span>
                                    <InputField value={prenomEtudiant} disabled={true} onChange={setPrenomEtudiant} />
                                </div>
                                <div className="info-item">
                                    <span className="label">Nom</span>
                                    <InputField value={nomEtudiant} disabled={true} onChange={setNomEtudiant} />
                                </div>
                            </div>
                        </div>

                        <div className="info-grid-container">
                            <h3>Enseignant déclarant</h3>
                            <div className="info-grid">
                                <div className={"info-item autocomplete-container " + `${showTeacherSuggestions ? "active" : ""}`}>
                                    <span className="label">Login Enseignant</span>
                                    <InputField
                                        value={loginProfesseur}
                                        disabled={!editing}
                                        onChange={handleTeacherInputChange}
                                        onBlur={() => setTimeout(() => setShowTeacherSuggestions(false), 200)}
                                        autoComplete="off"
                                    />

                                    {editing && showTeacherSuggestions && teacherSuggestions.length > 0 && (
                                        <ul className="suggestions-list">
                                            {teacherSuggestions.map((teacher, index) => (
                                                <li key={index} onMouseDown={() => handleSelectTeacherSuggestion(teacher)} className="suggestion-item">
                                                    <span className="suggestion-number">{teacher.loginENT}</span>

                                                    <div className="suggestion-preview">
                                                        <span>
                                                            <strong>
                                                                {teacher.prenom} {teacher.nom}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="info-item">
                                    <span className="label">Prénom</span>
                                    <InputField value={prenomProfesseur} disabled={true} onChange={setPrenomProfesseur} />
                                </div>
                                <div className="info-item">
                                    <span className="label">Nom</span>
                                    <InputField value={nomProfesseur} disabled={true} onChange={setNomProfesseur} />
                                </div>
                            </div>
                        </div>
                        <div className="selector-container">
                            <SelectTime value={dateValue} onChange={handleDateChange} />
                            <SelectSubject value={matiere} onSelect={setMatiere} promo={promo} pair={pair} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ModificationAbsence;
