import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import ReasonInput from "../../components/AbsenceForm/ReasonInput";
import PeriodAbsence from "../../components/AbsenceForm/PeriodAbsence";
import FileUpload from "../../components/AbsenceForm/FileUpload";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";
import CustomLoader from "../../components/common/CustomLoader";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";

import { useJustificationValidation } from "../../hooks/useJustificationValidation";

import { useJustificationSubmit } from "../../hooks/useJustificationSubmit";

const StudentJustificationPage = () => {
    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");
    const [period, setPeriod] = useState([]);
    const [files, setFiles] = useState([]);
    const [automaticPeriod, setAutomaticPeriod] = useState(false);
    const location = useLocation();
    const safeNavigate = useSafeNavigate(false);

    const { errors, periodError, reasonError, setPeriodError, setReasonError, validatePeriods, validateReason, validateAll } = useJustificationValidation();

    const { submit, isSubmitting } = useJustificationSubmit();

    useEffect(() => {
        if (location.state && location.state.prefilledPeriod) {
            const periodsWithIds = location.state.prefilledPeriod.map((p, index) => ({
                ...p,
                id: Date.now() + index,
            }));
            setPeriod(periodsWithIds);
            setPeriodError(false);
            setAutomaticPeriod(true);
        }
    }, [location.state, setPeriodError]);

    const handlePeriodChange = (newPeriods) => {
        const sortedPeriods = [...newPeriods].sort((a, b) => a.start - b.start);
        setPeriod(sortedPeriods);
        validatePeriods(sortedPeriods);
    };

    const handleSubmit = async () => {
        if (!validateAll(period, reason, comment)) {
            return;
        }

        const hasFiles = files.length > 0;
        const message = hasFiles ? "Confirmer l'envoi de l'absence ?" : "Voulez vous envoyer l'absence sans justificatif ?";

        if (window.confirm(message)) {
            const success = await submit(period, reason, comment, files, "create");
            if (success) {
                setReason("");
                setComment("");
                setPeriod([]);
                setFiles([]);
                safeNavigate("/dashboard");
            }
        }
    };

    return (
        <div className="student-justification-container">
            <div className="studentJustificationPage">
                <PageTitle title="Justifier une absence" icon={"icon-justification-student"} />
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
