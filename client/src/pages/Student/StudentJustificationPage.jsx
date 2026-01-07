import React, { useState } from "react";
import Title from "../../components/common/Title";
import ReasonInput from "../../components/AbsenceForm/ReasonInput";
import PeriodAbsence from "../../components/AbsenceForm/PeriodAbsence";
import FileUpload from "../../components/AbsenceForm/FileUpload";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

const StudentJustificationPage = () => {
    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");
    const [period, setPeriod] = useState([]);
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [reasonError, setReasonError] = useState(false);
    const [periodError, setPeriodError] = useState(false);

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
        toast.dismiss();

        if (period.length === 0) {
            toast.error("Veuillez ajouter au moins une période d'absence.");
            setPeriodError(true);
            hasError = true;
        } else if (Object.keys(errors).length > 0) {
            toast.error("Veuillez corriger les erreurs dans les périodes d'absence.");
            hasError = true;
        }

        if (!reason || !comment) {
            setReasonError(true);
            toast.error("Veuillez indiquer un motif et un commentaire.");
            hasError = true;
        }

        if (hasError) return;

        console.log("Form Data:", {
            reason,
            comment,
            period,
            files,
        });

        //TODO: (@killian) remplacer confirm par la belle boite de dialogue
        handleConfirm();
    };

    const handleConfirm = () => {
        const hasFiles = files.length > 0;

        const message = hasFiles ? "Confirmer l'envoi de l'absence ?" : "Voulez vous envoyer l'absence sans justificatif ?";

        if (confirm(message) && sendJustification()) {
            toast.success("Justification envoyée avec succès !");
        } else {
            toast.error("Justification non envoyée !");
        }
    };

    const sendJustification = () => {
        return true;
    };

    return (
        <div className="studentJustificationPage">
            <Title>Justifier une absence</Title>
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
                <Button onClick={handleSubmit} className="submit-button">
                    Envoyer la justification
                </Button>
            </div>
        </div>
    );
};

export default StudentJustificationPage;
