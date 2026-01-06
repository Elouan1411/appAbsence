import React, { useState } from "react";
import Title from "../../components/common/Title";
import ReasonInput from "../../components/AbsenceForm/ReasonInput";

import FileUpload from "../../components/AbsenceForm/FileUpload";

const StudentJustificationPage = () => {
    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");

    return (
        <div className="studentJustificationPage">
            <Title>Justifier une absence</Title>
            <ReasonInput reason={reason} comment={comment} onReasonChange={setReason} onCommentChange={setComment} />
            <FileUpload />
        </div>
    );
};

export default StudentJustificationPage;
