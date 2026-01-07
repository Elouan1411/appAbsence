import React, { useState } from "react";
import Title from "../../components/common/Title";
import ReasonInput from "../../components/AbsenceForm/ReasonInput";
import PeriodAbsence from "../../components/AbsenceForm/PeriodAbsence";
import FileUpload from "../../components/AbsenceForm/FileUpload";

const StudentJustificationPage = () => {
    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");

    return (
        <div className="studentJustificationPage">
            <Title>Justifier une absence</Title>
            <PeriodAbsence />
            <hr className="section-divider" />
            <ReasonInput reason={reason} comment={comment} onReasonChange={setReason} onCommentChange={setComment} />
            <hr className="section-divider" />
            <FileUpload />
        </div>
    );
};

export default StudentJustificationPage;
