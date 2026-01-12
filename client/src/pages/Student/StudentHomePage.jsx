import React, { useState } from "react";
import { List } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import "../../style/Student.css";
import AbsenceCard from "../../components/StudentDashboard/AbsenceCard";
import DashboardTabs from "../../components/StudentDashboard/DashboardTabs";

function StudentHomePage() {
    const [activeTab, setActiveTab] = useState("todo");

    const absences = [
        { id: 1, subject: "Mathématiques", startTime: "08:00", endTime: "09:00", status: "todo", date: "LUNDI 06 JANVIER" },
        { id: 2, subject: "Anglais", startTime: "10:00", endTime: "11:00", status: "todo", date: "LUNDI 06 JANVIER" },
    ];

    const counts = {
        todo: 2,
        pending: 0,
        archived: 0,
    };

    return (
        <div className="student-dashboard-container">
            <div className="studentJustificationPage">
                <div className="dashboard-header">
                    <PageTitle title="Mes Absences" icon="icon-home" />
                    <div className="dashboard-actions">
                        <p className="dashboard-subtitle">Gérez vos justificatifs et suivez vos demandes.</p>
                        <button className="btn-select">
                            <List size={18} strokeWidth={2.5} />
                            Sélectionner
                        </button>
                    </div>
                </div>

                <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

                <div className="dashboard-content">
                    {activeTab === "todo" && (
                        <div className="absences-list">
                            <div className="absences-date-header">
                                <h4 className="absences-list-header">LUNDI 06 JANVIER</h4>
                                <div className="date-divider-line"></div>
                            </div>
                            {absences.map((absence) => (
                                <AbsenceCard key={absence.id} subject={absence.subject} startTime={absence.startTime} endTime={absence.endTime} />
                            ))}
                        </div>
                    )}
                    {activeTab === "pending" && <div className="empty-state">Aucune absence en cours.</div>}
                    {activeTab === "archived" && <div className="empty-state">Aucune archive.</div>}
                </div>
            </div>
        </div>
    );
}

export default StudentHomePage;
