import React, { useState } from "react";
import "../../style/Teacher.css";
import RollCallList from "../../components/Teacher/RollCallList";
import SelectGroup from "../../components/Teacher/SelectGroup";
import SelectTime from "../../components/Teacher/SelectTime";
import SelectSubject from "../../components/Teacher/SelectSubject";
import PageTitle from "../../components/common/PageTitle";
import { useAuth } from "../../hooks/useAuth";
import InputField from "../../components/common/InputField";

function RollCallPage() {
    const [selection, setSelection] = useState(null);
    const [dateTime, setDateTime] = useState({ date: "", startTime: "", endTime: "" });
    const [subject, setSubject] = useState("");
    const [loginENT, setLoginENT] = useState("");

    const { role } = useAuth();

    return (
        <div className="page-container">
            <PageTitle title="Faire l'appel" icon="icon-rollcall" />

            {role == "admin" && (
                <div className="login-input-container">
                    <InputField value={loginENT} onChange={(e) => setLoginENT(e.target.value)} placeholder="identifiant" text="Identifiant ENT" />
                </div>
            )}

            <div className="select-container">
                <SelectGroup onValidate={(sel) => setSelection(sel)} date={dateTime.date} className="select-item-large" initialData={null} />

                <SelectTime onChange={setDateTime} value={dateTime} className="select-item" />

                <SelectSubject onSelect={setSubject} promo={selection?.promo} pair={selection?.semestre} className="select-item" value={subject} />
            </div>

            <RollCallList criteria={selection} dateTime={dateTime} subject={subject} loginENT={loginENT} />
        </div>
    );
}

export default RollCallPage;
