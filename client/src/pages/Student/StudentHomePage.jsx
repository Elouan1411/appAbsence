import React, { useState, useEffect } from "react";
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
import { useAuth } from "../../hooks/useAuth";
import { useUnsaved } from "../../context/UnsavedContext";

function StudentHomePage() {
    const [activeTab, setActiveTab] = useState("todo");
    const { hasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    const { user } = useAuth();
    const [absences, setAbsences] = useState([]);
    const [pendingAbsences, setPendingAbsences] = useState([]);
    const [archivedAbsences, setArchivedAbsences] = useState([]);

    useEffect(() => {
        if (user) {
            // Fetch unjustified absences
            fetch(`http://localhost:3000/absence/unjustified/:${user}`, {
                method: "GET",
                credentials: "include",
            })
                .then((res) => (res.ok ? res.json() : []))
                .then((data) => {
                    const mappedAbsences = data.map((abs) => ({
                        id: abs.idAbsence,
                        subject: abs.nomMatiere || abs.codeMatiere,
                        start: String(abs.debut),
                        end: String(abs.fin),
                        status: "todo",
                        adminComment: abs.motifValidite,
                    }));
                    setAbsences(mappedAbsences);
                })
                .catch((err) => console.error("Erreur fetch absences:", err));

            // Fetch pending absences
            fetch(`http://localhost:3000/absence/in-progress/:${user}`, {
                method: "GET",
                credentials: "include",
            })
                .then((res) => (res.ok ? res.json() : []))
                .then((data) => {
                    const mappedPending = data.map((abs) => ({
                        id: abs.type === "JUSTIFICATION" ? `J-${abs.idAbsence}` : `A-${abs.idAbsence}`,
                        subject: abs.nomMatiere || abs.codeMatiere,
                        start: String(abs.debut),
                        end: String(abs.fin),
                        status: "pending",
                        reason: abs.motif,
                    }));
                    setPendingAbsences(mappedPending);
                })
                .catch((err) => console.error("Erreur fetch pending absences:", err));

            // Fetch archived absences
            fetch(`http://localhost:3000/absence/archived/:${user}`, {
                method: "GET",
                credentials: "include",
            })
                .then((res) => (res.ok ? res.json() : []))
                .then((data) => {
                    const mappedArchived = data.map((abs) => ({
                        id: abs.type === "JUSTIFICATION" ? `J-${abs.idAbsence}` : `A-${abs.idAbsence}`,
                        subject: abs.nomMatiere || abs.codeMatiere,
                        start: String(abs.debut),
                        end: String(abs.fin),
                        status: abs.validite === 0 ? "validated" : "refused",
                        reason: abs.motif,
                    }));
                    setArchivedAbsences(mappedArchived);
                })
                .catch((err) => console.error("Erreur fetch archived absences:", err));
        }
    }, [user]);

    const currentAbsences = activeTab === "todo" ? absences : activeTab === "pending" ? pendingAbsences : archivedAbsences;

    // Groupement par date
    const absencesByDate = currentAbsences.reduce((acc, abs) => {
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

    const counts = {
        todo: absences.length,
        pending: pendingAbsences.length,
        archived: archivedAbsences.length,
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
                    {activeTab === "todo" && absences.length > 0 && (
                        <button className="btn-select" onClick={toggleSelectionMode}>
                            {isSelectionMode ? <X size={18} strokeWidth={2.5} /> : <List size={18} strokeWidth={2.5} />}
                            {isSelectionMode ? "Annuler" : "Sélectionner"}
                        </button>
                    )}
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
                                status={absence.status}
                                reason={absence.reason}
                                adminComment={absence.adminComment}
                            />
                        ))}
                    </div>
                ))}
                {activeTab === "todo" && absences.length === 0 && <div className="empty-state">Aucune absence à justifier.</div>}
                {activeTab === "pending" && pendingAbsences.length === 0 && <div className="empty-state">Aucune absence en cours.</div>}
                {activeTab === "archived" && archivedAbsences.length === 0 && <div className="empty-state">Aucune archive.</div>}
            </div>
            {isSelectionMode && selectedIds.length > 0 && (
                <FloatingActionBar count={selectedIds.length} onJustify={() => handleJustifySelectioned(selectedIds)} />
            )}
        </div>
    );
}

export default StudentHomePage;
