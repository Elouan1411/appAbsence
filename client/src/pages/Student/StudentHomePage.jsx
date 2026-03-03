import React, { useState, useEffect } from "react";
// import { List, X, ArrowRight } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import "../../style/Student.css";
import "../../style/StudentMobile.css";
import AbsenceCard from "../../components/StudentDashboard/AbsenceCard";
import DashboardTabs from "../../components/StudentDashboard/DashboardTabs";
import FloatingActionBar from "../../components/StudentDashboard/FloatingActionBar";
import Pagination from "../../components/common/Pagination";
import parseTimestamp from "../../functions/parseTimestamp";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import { useAuth } from "../../hooks/useAuth";
import { useUnsaved } from "../../context/UnsavedContext";
import { API_URL } from "../../config";
import CustomLoader from "../../components/common/CustomLoader";
import { alertConfirm } from "../../hooks/alertConfirm";

function StudentHomePage() {
    const [activeTab, setActiveTab] = useState("todo");
    const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    const { user } = useAuth();
    const [absences, setAbsences] = useState([]);
    const [pendingAbsences, setPendingAbsences] = useState([]);
    const [archivedAbsences, setArchivedAbsences] = useState([]);

    // Pagination state
    const [paginationState, setPaginationState] = useState({
        todo: 1,
        pending: 1,
        archived: 1,
    });
    const [totals, setTotals] = useState({
        todo: 0,
        pending: 0,
        archived: 0,
    });

    // Manage unsaved changes for navigation
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (isSelectionMode && selectedIds.length > 0) {
            setHasUnsavedChanges(true, "Mode sélection actif", "Si vous quittez cette page, votre sélection sera perdue.");
        } else {
            setHasUnsavedChanges(false);
        }
    }, [isSelectionMode, selectedIds, setHasUnsavedChanges]);

    const ITEMS_PER_PAGE = 8;

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            Promise.all([fetchTodo(paginationState.todo), fetchPending(paginationState.pending), fetchArchived(paginationState.archived)]).finally(() =>
                setIsLoading(false),
            );
        }
    }, [user]);

    // Effect to refetch when page changes
    useEffect(() => {
        if (!user) return;
        setIsLoading(true);
        let promise;
        if (activeTab === "todo") promise = fetchTodo(paginationState.todo);
        if (activeTab === "pending") promise = fetchPending(paginationState.pending);
        if (activeTab === "archived") promise = fetchArchived(paginationState.archived);

        if (promise) {
            promise.finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [paginationState, activeTab]);

    const fetchTodo = (page) => {
        return fetch(`${API_URL}/absence/unjustified/:${user}?page=${page}&limit=${ITEMS_PER_PAGE}`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => (res.ok ? res.json() : { data: [], total: 0 }))
            .then((response) => {
                const data = Array.isArray(response) ? response : response.data || [];
                const total = Array.isArray(response) ? response.length : response.total || 0;

                const mappedAbsences = data.map((abs) => ({
                    id: abs.idAbsence,
                    subject: abs.nomMatiere || abs.codeMatiere,
                    teacher: abs.nomProf && abs.prenomProf ? `${abs.nomProf.toUpperCase()} ${abs.prenomProf.charAt(0)}.` : null,
                    start: String(abs.debut),
                    end: String(abs.fin),
                    status: "todo",
                    adminComment: abs.motifValidite,
                    reason: abs.motif,
                    justificationId: abs.idAbsJustifiee,
                    dateDemande: abs.dateDemande,
                }));
                setAbsences(mappedAbsences);
                setTotals((prev) => ({ ...prev, todo: total }));
            })
            .catch((err) => console.error("Erreur fetch absences:", err));
    };

    const fetchPending = (page) => {
        return fetch(`${API_URL}/absence/in-progress/:${user}?page=${page}&limit=${ITEMS_PER_PAGE}`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => (res.ok ? res.json() : { data: [], total: 0 }))
            .then((response) => {
                const data = Array.isArray(response) ? response : response.data || [];
                const total = Array.isArray(response) ? response.length : response.total || 0;

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
                        teacher: abs.nomProf && abs.prenomProf ? `${abs.nomProf.toUpperCase()} ${abs.prenomProf.charAt(0)}.` : null,
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
                setTotals((prev) => ({ ...prev, pending: total }));
            })
            .catch((err) => console.error("Erreur fetch pending absences:", err));
    };

    const fetchArchived = (page) => {
        return fetch(`${API_URL}/absence/archived/:${user}?page=${page}&limit=${ITEMS_PER_PAGE}`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => (res.ok ? res.json() : { data: [], total: 0 }))
            .then((response) => {
                const data = Array.isArray(response) ? response : response.data || [];
                const total = Array.isArray(response) ? response.length : response.total || 0;

                const mappedArchived = data.map((abs) => ({
                    id: abs.type === "JUSTIFICATION" ? `J-${abs.idAbsence}` : `A-${abs.idAbsence}`,
                    subject: abs.nomMatiere || abs.codeMatiere,
                    teacher: abs.nomProf && abs.prenomProf ? `${abs.nomProf.toUpperCase()} ${abs.prenomProf.charAt(0)}.` : null,
                    start: String(abs.debut),
                    end: String(abs.fin),
                    status: abs.validite === 0 ? "validated" : "refused",
                    reason: abs.motif,
                    adminComment: abs.motifValidite,
                    justificationId: abs.idAbsJustifiee,
                }));
                setArchivedAbsences(mappedArchived);
                setTotals((prev) => ({ ...prev, archived: total }));
            })
            .catch((err) => console.error("Erreur fetch archived absences:", err));
    };

    const handlePageChange = (newPage) => {
        setPaginationState((prev) => ({ ...prev, [activeTab]: newPage }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const currentAbsences = activeTab === "todo" ? absences : activeTab === "pending" ? pendingAbsences : archivedAbsences;

    // add info in date
    const enrichedAbsences = currentAbsences.map((abs) => {
        const startDate = parseTimestamp(abs.start);
        const endDate = parseTimestamp(abs.end);
        const dateLabel = format(startDate, "EEEE dd MMMM", { locale: fr }).toUpperCase();

        const isMultiDay = !isSameDay(startDate, endDate);
        const timeFormat = isMultiDay ? "dd/MM HH:mm" : "HH:mm";

        return {
            ...abs,
            startDateObj: startDate,
            endDateObj: endDate,
            formattedStartTime: format(startDate, timeFormat),
            formattedEndTime: format(endDate, timeFormat),
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

        safeNavigate("/etudiant/justification", {
            state: { prefilledPeriod: selectedPeriods },
        });
    };

    const counts = totals; // Use backend totals

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds([]);
    };

    const handleTabChange = async (tabId) => {
        if (isSelectionMode && selectedIds.length > 0) {
            const result = await alertConfirm("Mode sélection actif", "Si vous quittez cette page, votre sélection sera perdue.");

            if (result.isConfirmed) {
                toggleSelectionMode();
                setActiveTab(tabId);
            }
        } else {
            setActiveTab(tabId);
        }
    };

    const handleToggleAbsence = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleAbsenceDeleted = (justificationId) => {
        // Refresh lists
        fetchPending(paginationState.pending);
        fetchTodo(paginationState.todo);
    };

    return (
        <div className="studentJustificationPageContainer">
            <PageTitle title="Mes Absences" icon="icon-home" />
            <div className="studentJustificationPage">
                <div className="dashboard-header">
                    <div className="dashboard-actions">
                        <p className="dashboard-subtitle">Gérez vos justificatifs et suivez vos demandes.</p>
                        <div className="dashboard-buttons-container">
                            <button
                                className="btn-icon"
                                onClick={() => {
                                    setIsLoading(true);
                                    Promise.all([
                                        fetchTodo(paginationState.todo),
                                        fetchPending(paginationState.pending),
                                        fetchArchived(paginationState.archived),
                                    ]).finally(() => setIsLoading(false));
                                }}
                                title="Actualiser"
                            >
                                <span className="icon icon-refresh icon-xl" style={{ backgroundColor: "var(--primary-color)" }}  title="Actualiser" />
                            </button>
                            {activeTab === "todo" && absences.length > 0 && (
                                <button className="btn-select" onClick={toggleSelectionMode}>
                                    {isSelectionMode ? (
                                        // <X size={18} strokeWidth={2.5} />
                                        <span className="icon icon-x icon-xl icon-white icon-bold"  title="Annuler" />
                                    ) : (
                                        // <List size={18} strokeWidth={2.5} />
                                        <span className="icon icon-list icon-xl icon-bold"  title="Sélectionner" />
                                    )}
                                    {isSelectionMode ? "Annuler" : "Sélectionner"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <DashboardTabs activeTab={activeTab} setActiveTab={handleTabChange} counts={counts} />

                <div className="dashboard-content">
                    {isLoading ? (
                        <CustomLoader />
                    ) : (
                        <>
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
                                            teacher={absence.teacher}
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
                            {activeTab === "todo" && absences.length === 0 && <div className="no-data-message">Aucune absence à justifier.</div>}
                            {activeTab === "pending" && pendingAbsences.length === 0 && <div className="no-data-message">Aucune absence en cours.</div>}
                            {activeTab === "archived" && archivedAbsences.length === 0 && <div className="no-data-message">Aucune archive.</div>}

                            {counts[activeTab] > ITEMS_PER_PAGE && (
                                <Pagination
                                    currentPage={paginationState[activeTab]}
                                    totalPages={Math.ceil(counts[activeTab] / ITEMS_PER_PAGE)}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </div>
                <div className="mobile-spacer"></div>
                {isSelectionMode && selectedIds.length > 0 && (
                    <FloatingActionBar count={selectedIds.length} onJustify={() => handleJustifySelectioned(selectedIds)} />
                )}
            </div>
        </div>
    );
}

export default StudentHomePage;
