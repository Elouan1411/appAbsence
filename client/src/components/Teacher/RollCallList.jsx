import React, { useEffect, useState, useMemo, useCallback } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { lightTheme, darkTheme } from "../../constants/grid";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
import RseCell from "../Lists/StudentList/RseCell";
import "../../style/SelectGroups.css";
import "../../style/icon.css";
import { useTheme } from "../../hooks/useTheme";
import { alertConfirm } from "../../hooks/alertConfirm";
import toast from "react-hot-toast";
import { API_URL } from "../../config";
import "../../style/RollCallList.css";
import { useAuth } from "../../hooks/useAuth";
import isLoginInDatabase from "../../functions/isLoginInDatabase";
import CustomLoader from "../common/CustomLoader";

ModuleRegistry.registerModules([AllCommunityModule]);


const Icon = ({ name, iconColor, title, className }) => (
    <span
        className={`icon icon-${name} icon-xl ${className || ""}`}
        title={title}
        style={{ backgroundColor: iconColor }}
    />
);

const PresenceRenderer = (params) => {
    const isPresentCol = params.colDef.field === "present";
    const status = params.data.attendanceStatus;

    const isActive = isPresentCol ? status === "present" : status === "absent";
    const color = isPresentCol ? "#4caf50" : "#f44336";

    const handleClick = () => {
        const newStatus = isPresentCol ? "present" : "absent";
        if (status !== newStatus) {
            const newData = { ...params.data, attendanceStatus: newStatus };
            params.node.setData(newData);
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
                opacity: isActive ? 1 : 0.2, 
            }}
        >
            {isPresentCol ? (
                <Icon name="check-success" iconColor={color} />
            ) : (
                <Icon name="x" iconColor={color} />
            )}
        </div>
    );
};

const JustificationRenderer = (params) => {
    const validite = params.value;

    if (validite === undefined || validite === null) return null;

    let iconName = "";
    let title = "";
    let styleClass = ""; 

    if (validite === 0) {
        iconName = "check-circle";
        title = "Justifié (Validé)";
        styleClass = "icon-primary";
    } else if (validite === 2) {
        iconName = "clock";
        title = "Justifié (En attente)";
        styleClass = "icon-warning";
    } else {
        return null;
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Icon name={iconName} title={title} className={styleClass} />
        </div>
    );
};


function RollCallList({ criteria, dateTime, subject, callId, onSuccess, loginENT }) {
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [initialAbsences, setInitialAbsences] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    
    const theme = useTheme();
    const { user, role } = useAuth();

    const login = loginENT || (typeof user === 'object' ? user.login || user.username : user);

    const colDefs = useMemo(() => {
        const isPair = criteria?.semestre === "1";
        return [
            {
                field: "present",
                headerName: "Présent",
                width: 90,
                minWidth: 90,
                cellRenderer: PresenceRenderer, 
                cellStyle: { display: "flex", justifyContent: "center" },
                sortable: false,
                filter: false,
                resizable: false,
            },
            {
                field: "absent",
                headerName: "Absent",
                width: 90,
                minWidth: 90,
                cellRenderer: PresenceRenderer, 
                cellStyle: { display: "flex", justifyContent: "center" },
                sortable: false,
                filter: false,
                resizable: false,
            },
            {
                field: "justification",
                headerName: "Justif.",
                width: 80, 
                minWidth: 50,
                cellRenderer: JustificationRenderer, 
                cellStyle: { display: "flex", justifyContent: "center" },
                sortable: true,
            },
            { field: "nom", headerName: "Nom", minWidth: 150 },
            { field: "prenom", headerName: "Prénom", minWidth: 150 },
            {
                headerName: "RSE",
                field: "RSE",
                cellRenderer: RseCell,
                autoHeight: true,
                resizable: true,
                minWidth: 250,
            },
            {
                field: isPair ? "groupeTDPair" : "groupeTD",
                headerName: "TD",
                minWidth: 100,
            },
            {
                field: isPair ? "groupeTPPair" : "groupeTP",
                headerName: "TP",
                minWidth: 100,
            },
            { field: "numero", headerName: "Numéro", minWidth: 120 },
        ];
    }, [criteria]);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        filter: true,
        sortable: true,
        resizable: true,
    }), []);

    useEffect(() => {
        async function fetchStudents() {
            if (!criteria || !criteria.promo) return;

            try {
                setLoading(true);
                const pairParam = criteria.semestre === "1" ? "1" : "0";

                const response = await fetch(`${API_URL}/groups/${pairParam}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        promo: criteria.promo,
                        groupeTD: criteria.groupeTD,
                        groupeTP: criteria.groupeTP,
                    }),
                    credentials: "include",
                });

                if (!response.ok) throw new Error("Erreur chargement étudiants");
                const data = await response.json();
                const studentIds = data.map((s) => s.numero);

                let absencesForCall = [];
                let rseMap = {};
                let justifMap = {};

                const promises = [];

                if (callId) {
                    promises.push(
                        fetch(`${API_URL}/absence/appel/${callId}`, { credentials: "include" })
                            .then(res => res.ok ? res.json() : [])
                            .then(abs => { absencesForCall = abs; })
                            .catch(e => console.error("Err Absences", e))
                    );
                }

                if (studentIds.length > 0) {
                    promises.push(
                        fetch(`${API_URL}/rse/list`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ids: studentIds }),
                            credentials: "include",
                        })
                        .then(res => res.ok ? res.json() : {})
                        .then(rse => { rseMap = rse; })
                        .catch(e => console.error("Err RSE", e))
                    );

                    if (dateTime?.date && dateTime?.startTime && dateTime?.endTime) {
                        const formatForJustif = (d, t) => d.replaceAll("-", "") + t.replaceAll(":", "");
                        const startStr = formatForJustif(dateTime.date, dateTime.startTime);
                        const endStr = formatForJustif(dateTime.date, dateTime.endTime);

                        promises.push(
                            fetch(`${API_URL}/justification/rollCallJustification`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ 
                                    studentIds: studentIds, 
                                    start: startStr, 
                                    end: endStr 
                                }),
                                credentials: "include",
                            })
                            .then(res => res.ok ? res.json() : [])
                            .then(justifs => {
                                justifs.forEach(j => {
                                    justifMap[String(j.numeroEtudiant)] = j.validite;
                                });
                            })
                            .catch(e => console.error("Err Justif", e))
                        );
                    }
                }

                await Promise.all(promises);

                if (callId) {
                    setInitialAbsences(absencesForCall.map((a) => a.numeroEtudiant));
                }

                data.forEach((s) => {
                    s.RSE = rseMap[s.numero] || null;
                    s.justification = justifMap[String(s.numero)];

                    const codeJustif = parseInt(s.justification, 10);

                    const aUnJustificatif = !isNaN(codeJustif) && (codeJustif === 0 || codeJustif === 2);
                    
                    const etaitAbsentEnBase = absencesForCall.some((a) => a.numeroEtudiant === s.numero);

                    if (aUnJustificatif) {
                        s.attendanceStatus = "absent";
                        // console.log(`Étudiant ${s.nom} passé en ABSENT (Justificatif code: ${codeJustif})`);
                    } else if (callId && etaitAbsentEnBase) {
                        // console.log(`Étudiant ${s.nom} passé en ABSENT (Modif d'appel)`);
                        s.attendanceStatus = "absent";
                    } else {
                        // console.log(`Étudiant ${s.nom} passé en PRESENT`);
                        s.attendanceStatus = "present";
                    }
                });

                setRowData(data);   

            } catch (err) {
                console.error("Fetch error:", err);
                toast.error("Erreur lors du chargement de la liste.");
            } finally {
                setLoading(false);
            }
        }

        fetchStudents();
    }, [criteria, dateTime, callId]);

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    const handleValidateRollCall = async () => {
        if (role === "admin" && !loginENT) {
            toast.error("Veuillez saisir un identifiant ENT d'un enseignant.");
            return;
        }
        if (!subject) {
            toast.error("Veuillez sélectionner une matière.");
            return;
        }
        if (!dateTime.date || !dateTime.startTime || !dateTime.endTime) {
            toast.error("Veuillez vérifier la date et l'heure.");
            return;
        }
        if (dateTime.endTime <= dateTime.startTime) {
            toast.error("L'heure de fin doit être strictement supérieure à l'heure de début.");
            return;
        }

        if (role === "admin") {
            const estPresent = await isLoginInDatabase(loginENT);
            if (!estPresent) {
                toast.error("L'identifiant ne correspond à aucun enseignant.");
                return;
            }
        }

        const absentStudents = [];
        gridApi.forEachNode((node) => {
            if (node.data.attendanceStatus === "absent") {
                absentStudents.push(node.data);
            }
        });

        if (absentStudents.length === 0) {
            const decision = await alertConfirm("Aucun absent", "Valider que tout le monde est présent ?");
            if (!decision.isConfirmed) return;
        }

        const formatDate = (date, time) => date.replaceAll("-", "") + time.replaceAll(":", "");

        try {
            setUpdateLoading(true);

            if (callId) {
                const currentAbsentIds = absentStudents.map((s) => s.numero);
                const addedAbsences = absentStudents.filter((s) => !initialAbsences.includes(s.numero));
                const removedAbsenceIds = initialAbsences.filter((id) => !currentAbsentIds.includes(id));

                if (addedAbsences.length > 0) {
                    await fetch(`${API_URL}/absence/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            number: addedAbsences.map((s) => s.numero),
                            login: addedAbsences.map((s) => s.loginENT),
                            idAppel: callId,
                        }),
                        credentials: "include",
                    });
                }

                await Promise.all(removedAbsenceIds.map(id => 
                    fetch(`${API_URL}/absence/`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id, idAppel: callId }),
                        credentials: "include",
                    })
                ));

                toast.success("Appel mis à jour avec succès !");
                setInitialAbsences(currentAbsentIds);
                if (onSuccess) onSuccess();

            } else {
                const payload = {
                    start: formatDate(dateTime.date, dateTime.startTime),
                    end: formatDate(dateTime.date, dateTime.endTime),
                    loginProf: login,
                    code: subject,
                    promo: criteria.promo,
                    groupeTD: criteria.groupeTD,
                    groupeTP: criteria.groupeTP,
                };

                const responseAppel = await fetch(`${API_URL}/appel/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    credentials: "include",
                });

                if (!responseAppel.ok) throw new Error(await responseAppel.text());
                const dataAppel = await responseAppel.json();

                if (absentStudents.length > 0) {
                    const responseAbsence = await fetch(`${API_URL}/absence/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            number: absentStudents.map((s) => s.numero),
                            login: absentStudents.map((s) => s.loginENT),
                            idAppel: dataAppel.id,
                        }),
                        credentials: "include",
                    });
                    
                    if (!responseAbsence.ok) throw new Error("Erreur lors de la sauvegarde des absences");
                }

                toast.success("Appel validé avec succès !");
                if (onSuccess) onSuccess();
            }

        } catch (err) {
            console.error(err);
            toast.error("Erreur technique : " + err.message);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (!criteria || !criteria.promo) {
        return <div className="rollCallList-empty">Veuillez valider une sélection pour voir la liste.</div>;
    }

    return (
        <div
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                width: "calc(100% - 2rem)",
                height: "80vh",
                margin: "1rem",
                marginBottom: "2rem",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h2 style={{ verticalAlign: "bottom" }}>Liste d'appel</h2>
                <button className="validate-btn" style={{ fontSize: "1rem", marginTop: "0rem" }} onClick={handleValidateRollCall} disabled={updateLoading}>
                    {updateLoading ? <CustomLoader /> : "Valider l'appel"}
                </button>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className="rollCallList-container">
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={colDefs}
                        defaultColDef={defaultColDef}
                        theme={theme === "dark" ? darkTheme : lightTheme}
                        onGridReady={onGridReady}
                        pagination={true}
                        paginationPageSize={100}
                        localeText={AG_GRID_LOCALE_FR}
                        domLayout="autoHeight"
                    />
                </div>
            )}
        </div>
    );
}

export default RollCallList;