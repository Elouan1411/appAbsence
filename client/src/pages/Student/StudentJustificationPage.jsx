import React, { useState } from "react";
import Title from "../../components/common/Title";
import ReasonInput from "../../components/AbsenceForm/ReasonInput";

const StudentJustificationPage = () => {
    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");

    return (
        <div>
            <Title>Justifier une absence</Title>
            <ReasonInput reason={reason} comment={comment} onReasonChange={setReason} onCommentChange={setComment} />
            <p>Commentaire : {comment}</p>
            <p>Motif : {reason}</p>
        </div>
    );
};

export default StudentJustificationPage;
