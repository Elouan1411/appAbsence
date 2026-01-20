import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import ReasonInput from "../../components/AbsenceForm/ReasonInput";
import FileUpload from "../../components/AbsenceForm/FileUpload";
import Button from "../../components/common/Button";
import PeriodAbsence from "../../components/AbsenceForm/PeriodAbsence";
import CustomLoader from "../../components/common/CustomLoader";
import { useJustificationValidation } from "../../hooks/useJustificationValidation";
import { useJustificationSubmit } from "../../hooks/useJustificationSubmit";

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

    const { errors, periodError, reasonError, validatePeriods, validateReason, validateAll } = useJustificationValidation();

    const { submit, isSubmitting } = useJustificationSubmit();

    const [isEditable, setIsEditable] = useState(true);

    useEffect(() => {
        const loadFiles = async (justifId) => {
            try {
                const response = await fetch(`http://localhost:3000/justification/${justifId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                if (data.list && Array.isArray(data.list) && data.list.length > 0) {
                    const filePromises = data.list.map(async (filename) => {
                        try {
                            const fileRes = await fetch(`http://localhost:3000/upload/justification/${filename}`);
                            if (!fileRes.ok) return null;
                            const blob = await fileRes.blob();
                            const file = new File([blob], filename, { type: blob.type });
                            file.isExisting = true;
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

        if (location.state) {
            if (location.state.dateDemande) {
                setDateDemande(location.state.dateDemande);
            }
            if (location.state.prefilledPeriod) {
                const periods = location.state.prefilledPeriod.map((p, idx) => ({
                    ...p,
                    start: new Date(p.start),
                    end: new Date(p.end),
                    id: p.id || Date.now() + idx,
                }));
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
                loadFiles(location.state.justificationId);
            }
        }
    }, [location.state]);

    const handlePeriodChange = (newPeriods) => {
        const sortedPeriods = [...newPeriods].sort((a, b) => a.start - b.start);
        setPeriod(sortedPeriods);
        validatePeriods(sortedPeriods);
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
    };

    const handleUpdate = async () => {
        if (!validateAll(period, reason, comment)) {
            return;
        }

        const success = await submit(period, reason, comment, files, "update", id, removedFiles, dateDemande);
        if (success) {
            navigate("/student/justification");
        }
    };

    return (
        <div className="student-justification-container">
            <div className="studentJustificationPage">
                <PageTitle title="Détails de l'absence" icon="icon-justification-student" />

                <PeriodAbsence period={period} setPeriod={handlePeriodChange} errors={errors} error={periodError} automaticPeriod={false} />

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

                <FileUpload files={files} setFiles={handleFilesChange} />
                <div style={{ marginTop: "30px" }}>
                    <Button onClick={handleUpdate} className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? <CustomLoader /> : "Modifier la justification"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StudentAbsenceDetailsPage;
