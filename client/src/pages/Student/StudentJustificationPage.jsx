import React, { useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import ReasonInput from "../../components/AbsenceForm/ReasonInput";
import PeriodAbsence from "../../components/AbsenceForm/PeriodAbsence";
import FileUpload from "../../components/AbsenceForm/FileUpload";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import CustomLoader from "../../components/common/CustomLoader";

const StudentJustificationPage = () => {
    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");
    const [period, setPeriod] = useState([]);
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [reasonError, setReasonError] = useState(false);
    const [periodError, setPeriodError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const periodsOverlap = (p1, p2) => {
        if (!p1.start || !p1.end || !p2.start || !p2.end) return false;
        return p1.start < p2.end && p2.start < p1.end;
    };

    const validatePeriods = (currentPeriods) => {
        const newErrors = {};
        const overlapErrorMsg = "Les périodes se chevauchent";
        const invalidDateErrorMsg = "La date de fin doit être postérieure au début";
        let hasOverlap = false;
        let hasInvalidDate = false;

        for (let i = 0; i < currentPeriods.length; i++) {
            const p1 = currentPeriods[i];

            // Check if start >= end
            if (p1.start >= p1.end) {
                newErrors[p1.id] = invalidDateErrorMsg;
                hasInvalidDate = true;
            }

            // Check for overlaps
            for (let j = i + 1; j < currentPeriods.length; j++) {
                const p2 = currentPeriods[j];
                if (periodsOverlap(p1, p2)) {
                    if (!newErrors[p1.id]) newErrors[p1.id] = overlapErrorMsg;
                    if (!newErrors[p2.id]) newErrors[p2.id] = overlapErrorMsg;
                    hasOverlap = true;
                }
            }
        }

        setErrors(newErrors);
        toast.dismiss();

        if (hasInvalidDate) {
            toast.error(invalidDateErrorMsg);
        } else if (hasOverlap) {
            toast.error(overlapErrorMsg);
        }

        return Object.keys(newErrors).length === 0;
    };

    const handlePeriodChange = (newPeriods) => {
        const sortedPeriods = [...newPeriods].sort((a, b) => a.start - b.start);
        setPeriod(sortedPeriods);
        setPeriodError(false);
        validatePeriods(sortedPeriods);
    };

    const handleSubmit = () => {
        let hasError = false;
        setIsSubmitting(true);
        toast.dismiss();

        if (period.length === 0) {
            toast.error("Veuillez ajouter au moins une période d'absence.");
            setPeriodError(true);
            hasError = true;
        } else if (Object.keys(errors).length > 0) {
            toast.error("Veuillez corriger les erreurs dans les périodes d'absence.");
            hasError = true;
        }

        if (!reason || (reason === "autre" && !comment)) {
            setReasonError(true);
            const errorMsg = !reason ? "Veuillez indiquer un motif." : "Veuillez ajouter un commentaire pour le motif 'Autre'.";
            toast.error(errorMsg);
            hasError = true;
        }

        if (hasError) {
            setIsSubmitting(false);
            return;
        }

        console.log("Form Data:", {
            reason,
            comment,
            period,
            files,
        });

        //TODO: (@killian) remplacer confirm par la belle boite de dialogue
        handleConfirm();
    };

    const handleConfirm = async () => {
        const hasFiles = files.length > 0;
        const message = hasFiles ? "Confirmer l'envoi de l'absence ?" : "Voulez vous envoyer l'absence sans justificatif ?";

        if (window.confirm(message)) {
            const success = await sendJustification();
            if (success) {
                toast.success("Justification envoyée avec succès !");
                setReason("");
                setComment("");
                setPeriod([]);
                setFiles([]);
            } else {
                toast.error("Erreur lors de l'envoi de la justification.");
            }
        }
        setIsSubmitting(false);
    };

    const sendJustification = async () => {
        try {
            // get timestamp here, for have same timestamp for all periods
            const now = new Date();
            // Format YYYYMMDDMMSS
            const timestamp =
                now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, "0") +
                now.getDate().toString().padStart(2, "0") +
                now.getHours().toString().padStart(2, "0") +
                now.getMinutes().toString().padStart(2, "0") +
                now.getSeconds().toString().padStart(2, "0");

            let firstJustificationId = null;

            for (const p of period) {
                const formData = {
                    start: new Date(p.start).getTime(),
                    end: new Date(p.end).getTime(),
                    justification: reason + (comment ? " | " + comment : ""),
                    timestamp: now.getTime(), // Send common timestamp
                };

                const response = await fetch("http://localhost:3000/justification", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                    credentials: "include",
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Justification submission failed:", errorText);
                    return false;
                }

                const justificationId = await response.json();

                if (!firstJustificationId) {
                    firstJustificationId = justificationId;
                }
            }

            // Upload files only once, attached to the first justification ID
            if (files.length > 0 && firstJustificationId) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileData = new FormData();
                    // Naming convention: idAbsJustifiee-docN-YYYYMMDDMMSS
                    const customName = `${firstJustificationId}-doc${i + 1}-${timestamp}`;

                    fileData.append("file", file);
                    fileData.append("fileName", customName);

                    const fileResponse = await fetch("http://localhost:3000/file/upload", {
                        method: "POST",
                        body: fileData,
                        credentials: "include",
                    });

                    if (!fileResponse.ok) {
                        console.error("File upload failed for justification", firstJustificationId);
                    }
                }
            }
            return true;
        } catch (error) {
            console.error("Error in sendJustification:", error);
            return false;
        }
    };

    return (
        <div className="student-justification-container">
            <div className="studentJustificationPage">
                <PageTitle title="Justifier une absence" icon={"icon-justification-student"} />
                <PeriodAbsence period={period} setPeriod={handlePeriodChange} errors={errors} error={periodError} />
                <hr className="section-divider" />
                <ReasonInput
                    reason={reason}
                    comment={comment}
                    onReasonChange={(val) => {
                        setReason(val);
                        if (val) setReasonError(false);
                    }}
                    onCommentChange={(val) => {
                        setComment(val);
                        if (val) setReasonError(false);
                    }}
                    error={reasonError}
                />
                <hr className="section-divider" />
                <FileUpload files={files} setFiles={setFiles} />

                <div style={{ marginTop: "30px" }}>
                    <Button onClick={handleSubmit} className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? <CustomLoader /> : "Envoyer la justification"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StudentJustificationPage;
