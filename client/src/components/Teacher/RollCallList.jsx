import React, { useEffect, useState, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { lightTheme, darkTheme } from "../../constants/grid";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
import RseCell from "../StudentList/RseCell";
import "../../style/SelectGroups.css";
import "../../style/icon.css";
import { useTheme } from "../../hooks/useTheme";
import { alertConfirm } from "../../hooks/alertConfirm";
import toast from "react-hot-toast";

ModuleRegistry.registerModules([AllCommunityModule]);

import { useAuth } from "../../hooks/useAuth";

function RollCallList({ criteria, dateTime, subject }) {
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [gridApi, setGridApi] = useState(null);
    const theme = useTheme();
    const { user } = useAuth();

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

        const Icon = ({ name, iconColor }) => (
            <span
                className={`icon icon-${name}`}
                style={{
                    width: 20,
                    height: 20,
                    backgroundColor: iconColor,
                }}
            />
        );

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
                {isPresentCol ? <Icon name="check-success" iconColor={color} /> : <Icon name="x" iconColor={color} />}
            </div>
        );
    };

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

    const defaultColDef = useMemo(
        () => ({
            flex: 1,
            filter: true,
            sortable: true,
            resizable: true,
        }),
        []
    );

    useEffect(() => {
        async function fetchStudents() {
            if (!criteria || !criteria.promo) return;

            setLoading(true);
            try {
                const pairParam = criteria.semestre === "1" ? "1" : "0";

                const response = await fetch(`http://localhost:3000/groups/${pairParam}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        promo: criteria.promo,
                        groupeTD: criteria.groupeTD,
                        groupeTP: criteria.groupeTP,
                    }),
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();

                    data.forEach((s) => (s.attendanceStatus = "present"));

                    const studentIds = data.map((s) => s.numero);
                    if (studentIds.length > 0) {
                        try {
                            const rseResponse = await fetch("http://localhost:3000/rse/list", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ ids: studentIds }),
                                credentials: "include",
                            });

                            if (rseResponse.ok) {
                                const rseMap = await rseResponse.json();
                                data.forEach((s) => {
                                    s.RSE = rseMap[s.numero] || null;
                                });
                            }
                        } catch (e) {
                            console.error("Error fetching RSE:", e);
                        }
                    }

                    console.log("Students with RSE:", data);
                    setRowData(data);
                } else {
                    console.error("Error fetching students:", response.status);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchStudents();
    }, [criteria]);

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    const handleValidateRollCall = async () => {
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

        // Filter for absent students
        const absentStudents = [];
        gridApi.forEachNode((node) => {
            if (node.data.attendanceStatus === "absent") {
                absentStudents.push(node.data);
            }
        });

        console.log("Absent students:", absentStudents);

        if (absentStudents.length === 0) {
            // if(!confirm("Aucun absent sélectionné. Valider quand même (tout le monde présent) ?")) return;
            if (await alertConfirm("Aucun absent sélectionné", "Valider quand même (tout le monde présent) ?")) return;
        }

        const numberList = absentStudents.map((s) => s.numero);
        const loginList = absentStudents.map((s) => s.loginENT);

        const formatDate = (date, time) => {
            return date.replaceAll("-", "") + time.replaceAll(":", "");
        }

        const payload = {
            number: numberList,
            login: loginList,
            start: formatDate(dateTime.date, dateTime.startTime),
            end: formatDate(dateTime.date, dateTime.endTime),
            loginProf: user,
            code: subject,
        };

        console.log("Sending Absence Payload:", payload);

        try {
            const responseAppel = await fetch("http://localhost:3000/appel/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    start: payload.start,
                    end: payload.end,
                    loginProf: payload.loginProf,
                    code: payload.code,
                }),
                credentials: "include",
            });

            let idAppel = null;
            if (responseAppel.ok) {
                const data = await responseAppel.json();
                idAppel = data.id;
            }

            const responseAbsence = await fetch("http://localhost:3000/absence/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...payload, idAppel }),
                credentials: "include",
            });

            if (responseAbsence.ok && responseAppel.ok) {
                toast.success("Appel validé avec succès !", { duration: 3000 });
            } else {
                let errText = "";
                if (!responseAbsence.ok) errText += "Erreur absence: " + (await responseAbsence.text()) + ". ";
                if (!responseAppel.ok) errText += "Erreur appel: " + (await responseAppel.text());
                toast.error("Erreur validation: " + errText);
            }
        } catch (err) {
            console.error(err);
            toast.error("Erreur réseau");
        }
    };

    if (!criteria) {
        return (
            <div
                style={{
                    textAlign: "center",
                    marginTop: "2rem",
                    color: "var(--text-secondary)",
                }}
            >
                Veuillez valider une sélection pour voir la liste.
            </div>
        );
    }

    return (
        <div
            style={{
                marginTop: "1rem",
                width: "100%",
                flex: 1,
                display: "flex",
                flexDirection: "column",
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
                <button className="validate-btn" style={{ fontSize: "1rem", marginTop: "0rem" }} onClick={handleValidateRollCall}>
                    Valider l'appel
                </button>
            </div>

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <div style={{ flex: 1, width: "100%" }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={colDefs}
                        defaultColDef={defaultColDef}
                        theme={theme === "dark" ? darkTheme : lightTheme}
                        onGridReady={onGridReady}
                        pagination={true}
                        paginationPageSize={100}
                        localeText={AG_GRID_LOCALE_FR}
                    />
                </div>
            )}
        </div>
    );
}

export default RollCallList;
