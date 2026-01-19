import React, { useState } from "react";
import { List, X, ArrowRight } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import "../../style/Student.css";
import AbsenceCard from "../../components/StudentDashboard/AbsenceCard";
import DashboardTabs from "../../components/StudentDashboard/DashboardTabs";
import FloatingActionBar from "../../components/StudentDashboard/FloatingActionBar";
import parseTimestamp from "../../functions/parseTimestamp";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import { useUnsaved } from "../../context/UnsavedContext";

function StudentHomePage() {
    const [activeTab, setActiveTab] = useState("todo");
    const { hasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    //TODO:temp
    const absences = [
        { id: 1, subject: "Maths", start: "202601060800", end: "202601060900" },
        { id: 2, subject: "Anglais", start: "202601061000", end: "202601061100" },
    ];

    // Groupement par date
    const absencesByDate = absences.reduce((acc, abs) => {
        const startDate = parseTimestamp(abs.start);
        const endDate = parseTimestamp(abs.end);

        const dateKey = format(startDate, "EEEE dd MMMM", { locale: fr }).toUpperCase();

        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }

        acc[dateKey].push({
            ...abs,
            startDateObj: startDate,
            endDateObj: endDate,
            formattedStartTime: format(startDate, "HH:mm"),
            formattedEndTime: format(endDate, "HH:mm"),
        });

        return acc;
    }, {});

    const handleJustifySelectioned = (selectedIds) => {
        const selectedPeriods = absences
            .filter((abs) => selectedIds.includes(abs.id))
            .map((abs) => ({
                start: parseTimestamp(abs.start),
                end: parseTimestamp(abs.end),
            }));

        safeNavigate("/dashboard/justification", {
            state: { prefilledPeriod: selectedPeriods },
        });
    };

    //TODO:temp
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
                {Object.entries(absencesByDate).map(([dateLabel, absenceList]) => (
                    <div key={dateLabel} className="absences-list">
                        <div className="absences-date-header">
                            <h4 className="absences-list-header">{dateLabel}</h4>
                            <div className="date-divider-line"></div>
                        </div>
                        {absenceList.map((absence) => (
                            <AbsenceCard
                                key={absence.id}
                                subject={absence.subject}
                                startTime={absence.formattedStartTime}
                                endTime={absence.formattedEndTime}
                                fullPeriod={{ start: absence.startDateObj, end: absence.endDateObj }}
                                isSelectionMode={isSelectionMode}
                                isSelected={selectedIds.includes(absence.id)}
                                onToggle={() => handleToggleAbsence(absence.id)}
                            />
                        ))}
                    </div>
                ))}
                {activeTab === "pending" && <div className="empty-state">Aucune absence en cours.</div>}
                {activeTab === "archived" && <div className="empty-state">Aucune archive.</div>}
            </div>
            {isSelectionMode && selectedIds.length > 0 && (
                <FloatingActionBar count={selectedIds.length} onJustify={() => handleJustifySelectioned(selectedIds)} />
            )}
        </div>
    );
}

export default StudentHomePage;
