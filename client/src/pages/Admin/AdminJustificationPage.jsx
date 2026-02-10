import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import ReasonInput from "../../components/AbsenceForm/ReasonInput";
import PeriodAbsence from "../../components/AbsenceForm/PeriodAbsence";
import FileUpload from "../../components/AbsenceForm/FileUpload";
import Button from "../../components/common/Button";
import CustomLoader from "../../components/common/CustomLoader";
import { useJustificationValidation } from "../../hooks/useJustificationValidation";
import { useJustificationSubmit } from "../../hooks/useJustificationSubmit";
import { alertConfirm } from "../../hooks/alertConfirm";
import toast from "react-hot-toast";
import SearchInput from "../../components/common/SearchInput";
import "../../style/Student.css";
import "../../style/Admin.css";
import { API_URL } from "../../config";

const AdminJustificationPage = () => {
    const location = useLocation();
    const [allStudents, setAllStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");
    const [period, setPeriod] = useState([]);
    const [files, setFiles] = useState([]);
    const [automaticPeriod, setAutomaticPeriod] = useState(false);
    const { errors, periodError, reasonError, setPeriodError, validatePeriods, validateReason, validateAll } = useJustificationValidation();
    const { submit, isSubmitting } = useJustificationSubmit();
    const [isLoading, setIsLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [waitingLoading, setWaitingLoading] = useState(false);
    const [refuseLoading, setRefuseLoading] = useState(false);
    const [acceptLoading, setAcceptLoading] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_URL}/eleve/all`, { credentials: "include" });
                if (response.ok) {
                    const data = await response.json();
                    setAllStudents(data);
                }
            } catch (error) {
                console.error("Error fetching students", error);
                toast.error("Impossible de charger la liste des étudiants");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        if (location.state && location.state.studentInfo && allStudents.length > 0) {
            const student = allStudents.find((s) => s.loginENT === location.state.studentInfo.loginENT);
            if (student) {
                setSelectedStudent(student);
            }
        }

        if (location.state && location.state.prefilledPeriod) {
            const periodsWithIds = location.state.prefilledPeriod.map((p, index) => ({
                ...p,
                id: Date.now() + index,
            }));
            setPeriod(periodsWithIds);
            setPeriodError(false);
            setAutomaticPeriod(true);
        }
    }, [location.state, allStudents, setPeriodError]);

    useEffect(() => {
        if (searchTerm.length >= 1 && !selectedStudent) {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = allStudents
                .filter(
                    (s) =>
                        s.nom.toLowerCase().includes(lowerTerm) ||
                        s.prenom.toLowerCase().includes(lowerTerm) ||
                        (s.loginENT && s.loginENT.toLowerCase().includes(lowerTerm)) ||
                        String(s.numero).includes(lowerTerm),
                )
                .slice(0, 10);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, allStudents, selectedStudent]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (selectedStudent) {
            setSelectedStudent(null);
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setSearchTerm("");
        setSuggestions([]);
    };

    const handleDeselectStudent = () => {
        setSelectedStudent(null);
        setSearchTerm("");
    };

    const handlePeriodChange = (newPeriods) => {
        const sortedPeriods = [...newPeriods].sort((a, b) => a.start - b.start);
        setPeriod(sortedPeriods);
        validatePeriods(sortedPeriods);
    };

    const handleSubmit = async (action) => {
        if (!selectedStudent) {
            toast.error("Veuillez sélectionner un étudiant.");
            return;
        }

        if (!validateAll(period, reason, comment)) {
            return;
        }

        const hasFiles = files.length > 0;
        let message = "";
        if (action === "create") {
            message = hasFiles ? "Confirmer l'ajout de l'absence ?" : "Envoyer sans justificatif ?";
            setWaitingLoading(true);
        }
        if (action === "validate") {
            message = "Valider immédiatement cette justification ?";
            setAcceptLoading(true);
        }
        if (action === "refuse") {
            message = "Refuser immédiatement cette justification ?";
            setRefuseLoading(true);
        }

        const confirmation = await alertConfirm("Confirmation", message);
        if (!confirmation.isConfirmed) return;

        const result = await submit(period, reason, comment, files, "create", null, [], null, selectedStudent.loginENT);
        if (result && result.success) {
            if (action !== "create" && result.ids && result.ids.length > 0) {
                try {
                    for (const id of result.ids) {
                        const validationBody = {
                            value: action === "validate" ? "validate" : "deny",
                            reason: action === "refuse" ? "Refusé par l'administration lors de la création." : "",
                        };

                        const valRes = await fetch(`${API_URL}/justification/validate/${id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(validationBody),
                            credentials: "include",
                        });

                        if (!valRes.ok) {
                            console.error(`Failed to validate/refuse justification ${id}`);
                            toast.error(`Erreur lors de la validation/refus pour l'ID ${id}`);
                        }
                    }
                    if (action === "validate") toast.success("Justification validée !");
                    if (action === "refuse") toast.success("Justification refusée !");
                } catch (e) {
                    console.error("Error during validation sequence", e);
                }
            }

            setReason("");
            setComment("");
            setPeriod([]);
            setFiles([]);
            setSelectedStudent(null);
            setSearchTerm("");
            setPeriodError(false);
            setEditLoading(false);
        }
        setAcceptLoading(false);
        setWaitingLoading(false);
        setRefuseLoading(false);
    };

    return (
        <div className="student-justification-container">
            <PageTitle title="Justifier une absence (Admin)" icon={"icon-justification-student"} />
            <div className="admin-justification-wrapper">
                <div className="adminJustificationPage">
                    <div className="search-section" ref={searchRef}>
                        <label className="input-label">Étudiant concerné</label>
                        {!selectedStudent ? (
                            <>
                                <SearchInput
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Rechercher un étudiant (Nom, Prénom, N°...)"
                                    className="search-container-justification-admin"
                                />

                                {suggestions.length > 0 && (
                                    <ul className="suggestions-list">
                                        {suggestions.map((student) => (
                                            <li key={student.numero} onClick={() => handleSelectStudent(student)} className="suggestion-item">
                                                {student.nom} {student.prenom} - {student.promo} ({student.loginENT})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <div className="search-container-justification-admin choice">
                                <span>
                                    {selectedStudent.nom} {selectedStudent.prenom} ({selectedStudent.loginENT})
                                </span>
                                <span onClick={handleDeselectStudent} className="choice-close-btn">
                                    <span className="icon icon-x choice-close-icon"></span>
                                </span>
                            </div>
                        )}
                    </div>

                    <hr className="section-divider" />

                    <PeriodAbsence period={period} setPeriod={handlePeriodChange} errors={errors} error={periodError} automaticPeriod={automaticPeriod} />

                    <hr className="section-divider" />

                    <ReasonInput
                        reason={reason}
                        comment={comment}
                        onReasonChange={(val) => {
                            setReason(val);
                            validateReason(val, comment);
                        }}
                        onCommentChange={(val) => {
                            setComment(val);
                            validateReason(reason, val);
                        }}
                        error={reasonError}
                    />

                    <hr className="section-divider" />

                    <FileUpload files={files} setFiles={setFiles} />

                    {isSubmitting ? (
                        <div className="admin-loader-container">
                            <CustomLoader />
                        </div>
                    ) : (
                        <div className="admin-buttons-container">
                            <Button onClick={() => handleSubmit("create")} className="submit-button btn-waiting" disabled={isSubmitting}>
                                En attente
                            </Button>
                            <Button onClick={() => handleSubmit("refuse")} className="submit-button btn-refuse" disabled={isSubmitting}>
                                Refuser
                            </Button>
                            <Button onClick={() => handleSubmit("validate")} className="submit-button btn-validate" disabled={isSubmitting}>
                                Valider
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminJustificationPage;
