import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import ReasonInput from "../../components/AbsenceForm/ReasonInput";
import FileUpload from "../../components/AbsenceForm/FileUpload";
import FileReadOnlyList from "../../components/AbsenceForm/FileReadOnlyList";
import Button from "../../components/common/Button";
import PeriodAbsence from "../../components/AbsenceForm/PeriodAbsence";
import CustomLoader from "../../components/common/CustomLoader";
import AbsenceStatus from "../../components/AbsenceForm/AbsenceStatus";
import { useJustificationValidation } from "../../hooks/useJustificationValidation";
import { useJustificationSubmit } from "../../hooks/useJustificationSubmit";
import { alertConfirm } from "../../hooks/alertConfirm";
import { API_URL } from "../../config";
import NavigateBackButton from "../../components/common/NavigateBackButton";
import { useUnsaved } from "../../context/UnsavedContext";

const StudentAbsenceDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");
    const [files, setFiles] = useState([]);
    const [removedFiles, setRemovedFiles] = useState([]);
    const [period, setPeriod] = useState([]);
    const [dateDemande, setDateDemande] = useState(null);
    const [refusalReason, setRefusalReason] = useState("");
    const [status, setStatus] = useState("todo");

    const { errors, periodError, reasonError, validatePeriods, validateReason, validateAll } = useJustificationValidation();

    const { submit, isSubmitting } = useJustificationSubmit();
    const { setHasUnsavedChanges } = useUnsaved();

    const [isEditable, setIsEditable] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    console.log("chargement de la page");

    // Mark as unsaved helper
    const markAsUnsaved = () => {
        setHasUnsavedChanges(true, "Modifications non enregistrées", "Si vous quittez, vos modifications seront perdues.");
    };

    useEffect(() => {
        const loadFiles = async (justifId) => {
            console.log("chargement des fichiers");
            try {
                const response = await fetch(`${API_URL}/justification/${justifId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                if (!response.ok) {
                    return;
                }

                const data = await response.json();
                console.log("data", data);
                if (data.validite === 0 || data.validite === 1) {
                    setIsEditable(false);
                }

                if (data.list && Array.isArray(data.list) && data.list.length > 0) {
                    const filePromises = data.list.map(async (filename) => {
                        // Récupere les fichiers avec les "beaux" noms mais en gardant les noms originaux pour la supression
                        try {
                            const fileRes = await fetch(`${API_URL}/justification/download/${filename}`, {
                                credentials: "include",
                            });
                            if (!fileRes.ok) return null;
                            const blob = await fileRes.blob();

                            const contentDisposition = fileRes.headers.get("Content-Disposition");
                            let prettyName = filename;
                            if (contentDisposition) {
                                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                                if (filenameMatch && filenameMatch.length > 1) {
                                    prettyName = filenameMatch[1];
                                }
                            }

                            const file = new File([blob], prettyName, { type: blob.type });
                            file.isExisting = true;
                            file.originalName = filename;
                            return file;
                        } catch (e) {
                            return null;
                        }
                    });

                    const loadedFiles = (await Promise.all(filePromises)).filter((f) => f !== null);
                    setFiles(loadedFiles);
                }
            } catch (error) {
                console.error("Error loading justification files:", error);
            }
        };

        const init = async () => {
            console.log("lancement de useEffect");

            if (location.state) {
                console.log("Status received:", location.state.status);
                if (location.state.status === "validated" || location.state.status === "refused") {
                    setIsEditable(false);
                }

                if (location.state.status) {
                    setStatus(location.state.status);
                }

                if (location.state.adminComment) {
                    setRefusalReason(location.state.adminComment);
                }

                if (location.state.dateDemande) {
                    setDateDemande(location.state.dateDemande);
                }
                if (location.state.prefilledPeriod) {
                    let periods = location.state.prefilledPeriod.map((p, idx) => ({
                        ...p,
                        start: new Date(p.start),
                        end: new Date(p.end),
                        id: p.id || Date.now() + idx,
                    }));

                    // Filter out periods that are fully contained within another period
                    periods = periods.filter((p1) => {
                        return !periods.some((p2) => {
                            return p1 !== p2 && p2.start <= p1.start && p2.end >= p1.end;
                        });
                    });

                    setPeriod(periods);
                    validatePeriods(periods);
                }

                if (location.state.reason) {
                    const fullReason = location.state.reason;
                    const [parsedReason, parsedComment] = (fullReason || "").split(" | ");
                    const r = parsedReason;
                    const c = parsedComment || "";
                    setReason(r);
                    setComment(c);
                    validateReason(r, c);
                }

                if (location.state.justificationId) {
                    setIsLoading(true);
                    await loadFiles(location.state.justificationId);
                    setIsLoading(false);
                }
            }
        };

        init();
    }, [location.state]);

    const handlePeriodChange = (newPeriods) => {
        const sortedPeriods = [...newPeriods].sort((a, b) => a.start - b.start);
        setPeriod(sortedPeriods);
        validatePeriods(sortedPeriods);
        markAsUnsaved();
    };

    const handleFilesChange = (newFiles) => {
        if (typeof newFiles === "function") {
            setFiles((prev) => {
                const updated = newFiles(prev);
                const removed = prev.filter((p) => p.isExisting && !updated.includes(p));
                if (removed.length > 0) setRemovedFiles((curr) => [...curr, ...removed]);
                return updated;
            });
        } else {
            setFiles((prev) => {
                const removed = prev.filter((p) => p.isExisting && !newFiles.includes(p));
                if (removed.length > 0) setRemovedFiles((curr) => [...curr, ...removed]);
                return newFiles;
            });
        }
        markAsUnsaved();
    };

    const handleUpdate = async () => {
        const confirmation = await alertConfirm("Mise à jour de l'absence", "Voulez-vous vraiment mettre à jour cette absence ?");
        if (!confirmation.isConfirmed) {
            return;
        }
        if (!validateAll(period, reason, comment)) {
            return;
        }

        const targetId = location.state?.justificationId || id;
        const success = await submit(period, reason, comment, files, "update", targetId, removedFiles, dateDemande);
        if (success) {
            setHasUnsavedChanges(false);
            navigate("/etudiant");
        }
    };

    return (
        <div className="student-justification-container">
            <div className="studentJustificationPage">
                {isLoading ? (
                    <CustomLoader />
                ) : (
                    <>
                        <PageTitle title="Détails de l'absence" icon="icon-justification-student" canGoBack={true} />
                        <AbsenceStatus status={status} adminComment={refusalReason} />

                        <PeriodAbsence
                            period={period}
                            setPeriod={handlePeriodChange}
                            errors={errors}
                            error={periodError}
                            automaticPeriod={false}
                            readOnly={!isEditable}
                        />

                        <hr className="section-divider" />

                        <ReasonInput
                            reason={reason}
                            comment={comment}
                            onReasonChange={(val) => {
                                setReason(val);
                                validateReason(val, comment);
                                markAsUnsaved();
                            }}
                            onCommentChange={(val) => {
                                setComment(val);
                                validateReason(reason, val);
                                markAsUnsaved();
                            }}
                            error={reasonError}
                            readOnly={!isEditable}
                        />

                        <hr className="section-divider" />

                        {isEditable ? (
                            <>
                                <FileUpload files={files} setFiles={handleFilesChange} />
                                <div style={{ marginTop: "30px" }}>
                                    <Button onClick={handleUpdate} className="submit-button" disabled={isSubmitting}>
                                        {isSubmitting ? <CustomLoader /> : "Modifier la justification"}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <FileReadOnlyList files={files} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentAbsenceDetailsPage;
