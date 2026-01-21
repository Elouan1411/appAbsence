import React, { useState, useEffect } from "react";
import "../../style/Teacher.css";
import RollCallList from "../../components/Teacher/RollCallList";
import SelectGroup from "../../components/Teacher/SelectGroup";
import SelectTime from "../../components/Teacher/SelectTime";
import SelectSubject from "../../components/Teacher/SelectSubject";
import PageTitle from "../../components/common/PageTitle";
import { useAuth } from "../../hooks/useAuth";
import SelectTeacher from "../../components/Teacher/SelectTeacher";
import { useLocation } from "react-router-dom";

function RollCallPage() {
    const [selection, setSelection] = useState(null);
    const [dateTime, setDateTime] = useState({ date: "", startTime: "", endTime: "" });
    const [subject, setSubject] = useState("");
    const [loginENT, setLoginENT] = useState("");
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.shortcut) {
            const sc = location.state.shortcut;
            setSelection({
                promo: sc.promo,
                groupeTD: sc.groupeTD,
                groupeTP: sc.groupeTP,
                semestre: "1"
            });
            setSubject(sc.codeMatiere);
            setDateTime({ date: dateTime.date, startTime: dateTime.startTime, endTime: dateTime.endTime });
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const { role } = useAuth();

    const [resetKey, setResetKey] = useState(0);

    const handleSuccess = () => {
        setSelection(null);
        setDateTime({ date: dateTime.date, startTime: dateTime.startTime, endTime: dateTime.endTime });
        setSubject("");
        setLoginENT("");
        setResetKey((prev) => prev + 1);
    };

    return (
        <div className="page-container">
            <PageTitle title="Faire l'appel" icon="icon-rollcall" />

            <div className="select-container">
                {role === "admin" && <SelectTeacher value={loginENT} onChange={setLoginENT} className="select-item" />}
                <SelectGroup key={resetKey} onValidate={(sel) => setSelection(sel)} date={dateTime.date} className="select-item-large" initialData={null} initialSelection={selection} />

                <SelectTime onChange={setDateTime} value={dateTime} className="select-item" />

                <SelectSubject onSelect={setSubject} promo={selection?.promo} pair={selection?.semestre} className="select-item" value={subject} />
            </div>

            <RollCallList criteria={selection} dateTime={dateTime} subject={subject} loginENT={loginENT} onSuccess={handleSuccess} />
        </div>
    );
}

export default RollCallPage;
