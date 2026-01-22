import React, { useEffect } from "react";
import PageTitle from "../../components/common/PageTitle";
import toast from "react-hot-toast";
import AbsenceList from "../../components/AbsencePage/AbsenceList";
import "../../style/AbsencePage.css";

function AbsencePage() {
    return (
        <div className="absence-page-container">
            <PageTitle title="Absences" icon="icon-justification-student" />
            <div className="absence-page-subcontainer">
                <AbsenceList />
            </div>
        </div>
    );
}

export default AbsencePage;
