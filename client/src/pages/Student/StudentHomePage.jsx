import React, { useState } from "react";
import { List, X, ArrowRight } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import "../../style/Student.css";
import AbsenceCard from "../../components/StudentDashboard/AbsenceCard";
import DashboardTabs from "../../components/StudentDashboard/DashboardTabs";
import FloatingActionBar from "../../components/StudentDashboard/FloatingActionBar";

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

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds([]);
    };

    const handleToggleAbsence = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <div className="studentJustificationPage">
            <div className="dashboard-header">
                <PageTitle title="Mes Absences" icon="icon-home" />
                <div className="dashboard-actions">
                    <p className="dashboard-subtitle">Gérez vos justificatifs et suivez vos demandes.</p>
                    <button className="btn-select" onClick={toggleSelectionMode}>
                        {isSelectionMode ? <X size={18} strokeWidth={2.5} /> : <List size={18} strokeWidth={2.5} />}
                        {isSelectionMode ? "Annuler" : "Sélectionner"}
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
                            <AbsenceCard
                                key={absence.id}
                                subject={absence.subject}
                                startTime={absence.startTime}
                                endTime={absence.endTime}
                                isSelectionMode={isSelectionMode}
                                isSelected={selectedIds.includes(absence.id)}
                                onToggle={() => handleToggleAbsence(absence.id)}
                            />
                        ))}
                    </div>
                )}
                {activeTab === "pending" && <div className="empty-state">Aucune absence en cours.</div>}
                {activeTab === "archived" && <div className="empty-state">Aucune archive.</div>}
            </div>
            {isSelectionMode && selectedIds.length > 0 && (
                <FloatingActionBar count={selectedIds.length} onJustify={() => console.log("Justify", selectedIds)} />
            )}
        </div>
    );
}

export default StudentHomePage;
