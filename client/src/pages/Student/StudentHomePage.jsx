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
                        reason: abs.motif,
                        justificationId: abs.idAbsJustifiee,
                        dateDemande: abs.dateDemande,
                    }));
                    setAbsences(mappedAbsences);
                })
                .catch((err) => console.error("Erreur fetch absences:", err));

            fetchPendingAbsences();

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

    const fetchPendingAbsences = () => {
        if (!user) return;
        fetch(`http://localhost:3000/absence/in-progress/:${user}`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                // calculate groups to determine shared data (minId (for file), full list of periods)
                const groups = data.reduce((acc, abs) => {
                    const key = abs.dateDemande || abs.idAbsence;
                    if (!acc[key]) {
                        acc[key] = {
                            items: [],
                            minId: abs.idAbsJustifiee,
                        };
                    }
                    acc[key].items.push(abs);
                    if (abs.idAbsJustifiee && (!acc[key].minId || abs.idAbsJustifiee < acc[key].minId)) {
                        acc[key].minId = abs.idAbsJustifiee;
                    }
                    return acc;
                }, {});

                // Helper to parse DB date format YYYYMMDDHHMM or YYYYMMDDHHMMSS
                const parseDateStr = (str) => {
                    if (!str) return new Date();
                    const s = String(str);
                    if (s.length < 12) return new Date(s);

                    const y = parseInt(s.substring(0, 4));
                    const m = parseInt(s.substring(4, 6)) - 1;
                    const d = parseInt(s.substring(6, 8));
                    const h = parseInt(s.substring(8, 10));
                    const min = parseInt(s.substring(10, 12));
                    let sec = 0;
                    if (s.length >= 14) {
                        sec = parseInt(s.substring(12, 14));
                    }

                    return new Date(y, m, d, h, min, sec);
                };

                const mappedPending = data.map((abs) => {
                    const key = abs.dateDemande || abs.idAbsence;
                    const group = groups[key];

                    // Sort group items to create the full period list for details
                    const sortedGroupItems = [...group.items].sort((a, b) => parseDateStr(a.debut) - parseDateStr(b.debut));

                    const fullPeriods = sortedGroupItems.map((i) => ({
                        start: parseDateStr(i.debut),
                        end: parseDateStr(i.fin),
                        id: i.idAbsJustifiee || i.idAbsence,
                    }));

                    return {
                        id: abs.type === "JUSTIFICATION" ? `J-${abs.idAbsence}` : `A-${abs.idAbsence}`,
                        subject: abs.nomMatiere || abs.codeMatiere,
                        start: String(abs.debut),
                        end: String(abs.fin),
                        status: "pending",
                        reason: abs.motif,
                        justificationId: group.minId, // use min id for find file
                        fullPeriodGroup: fullPeriods,
                        dateDemande: parseDateStr(abs.dateDemande).getTime(),
                    };
                });

                setPendingAbsences(mappedPending);
            })
            .catch((err) => console.error("Erreur fetch pending absences:", err));
    };

    const currentAbsences = activeTab === "todo" ? absences : activeTab === "pending" ? pendingAbsences : archivedAbsences;

    // add info in date
    const enrichedAbsences = currentAbsences.map((abs) => {
        const startDate = parseTimestamp(abs.start);
        const endDate = parseTimestamp(abs.end);
        const dateLabel = format(startDate, "EEEE dd MMMM", { locale: fr }).toUpperCase();

        return {
            ...abs,
            startDateObj: startDate,
            endDateObj: endDate,
            formattedStartTime: format(startDate, "HH:mm"),
            formattedEndTime: format(endDate, "HH:mm"),
            dateLabel,
        };
    });

    // sort decroissant
    enrichedAbsences.sort((a, b) => b.startDateObj - a.startDateObj);

    // group by date
    const groupedAbsences = [];
    enrichedAbsences.forEach((abs) => {
        const lastGroup = groupedAbsences[groupedAbsences.length - 1];
        if (lastGroup && lastGroup.dateLabel === abs.dateLabel) {
            lastGroup.items.push(abs);
        } else {
            groupedAbsences.push({
                dateLabel: abs.dateLabel,
                items: [abs],
            });
        }
    });

    // sort croissant hours
    groupedAbsences.forEach((group) => {
        group.items.sort((a, b) => a.startDateObj - b.startDateObj);
    });

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

    const handleAbsenceDeleted = (justificationId) => {
        // Refresh pending list
        fetchPendingAbsences();

        // Re-fetch todo list to show the absences again as unjustified
        if (user) {
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
                        reason: abs.motif,
                        justificationId: abs.idAbsJustifiee,
                        dateDemande: abs.dateDemande,
                    }));
                    setAbsences(mappedAbsences);
                })
                .catch((err) => console.error("Erreur fetch absences:", err));
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
                {groupedAbsences.map((group) => (
                    <div key={group.dateLabel} className="absences-list">
                        <div className="absences-date-header">
                            <h4 className="absences-list-header">{group.dateLabel}</h4>
                            <div className="date-divider-line"></div>
                        </div>
                        {group.items.map((absence) => (
                            <AbsenceCard
                                key={absence.id}
                                id={absence.id}
                                subject={absence.subject}
                                startTime={absence.formattedStartTime}
                                endTime={absence.formattedEndTime}
                                fullPeriod={{ start: absence.startDateObj, end: absence.endDateObj, id: absence.justificationId }}
                                isSelectionMode={isSelectionMode}
                                isSelected={selectedIds.includes(absence.id)}
                                onToggle={() => handleToggleAbsence(absence.id)}
                                status={absence.status}
                                reason={absence.reason}
                                adminComment={absence.adminComment}
                                justificationId={absence.justificationId}
                                fullPeriodGroup={absence.fullPeriodGroup}
                                dateDemande={absence.dateDemande}
                                onDelete={handleAbsenceDeleted}
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
