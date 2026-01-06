import React, { useEffect, useState, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { lightTheme, darkTheme } from "../../constants/grid";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
import RseCell from "../StudentList/RseCell";
import "../../style/SelectGroups.css"; 

ModuleRegistry.registerModules([AllCommunityModule]);

import { useAuth } from "../../hooks/useAuth";
import { Check, X } from "lucide-react";

function RollCallList({ criteria, dateTime, subject }) {
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [gridApi, setGridApi] = useState(null);
    const theme = sessionStorage.getItem("theme");
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
                    opacity: isActive ? 1 : 0.2
                }}
            >
                {isPresentCol ? <Check size={20} color={color} strokeWidth={4} /> : <X size={20} color={color} strokeWidth={4} />}
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
            sortable: false, filter: false, resizable: false
        },
        {
            field: "absent",
            headerName: "Absent",
            width: 90,
            minWidth: 90,
            cellRenderer: PresenceRenderer,
            cellStyle: { display: "flex", justifyContent: "center" },
            sortable: false, filter: false, resizable: false
        },
        {
            field: "numero",
            headerName: "Numéro",
            minWidth: 120,
        },
        { field: "nom", headerName: "Nom", minWidth: 150 },
        { field: "prenom", headerName: "Prénom", minWidth: 150 },
        { field: isPair ? "groupeTDPair" : "groupeTD", headerName: "TD", minWidth: 100 },
        { field: isPair ? "groupeTPPair" : "groupeTP", headerName: "TP", minWidth: 100 },
        {
            headerName: "RSE",
            field: "RSE",
            cellRenderer: RseCell,
            autoHeight: true,
            resizable: true,
            minWidth: 250,
        },
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

        setLoading(true);
        try {
            const pairParam = criteria.semestre === "1" ? "1" : "0";

            const response = await fetch(`http://localhost:3000/groups/${pairParam}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                promo: criteria.promo,
                groupeTD: criteria.groupeTD,
                groupeTP: criteria.groupeTP
            }),
            credentials: "include",
            });

            if (response.ok) {
            const data = await response.json();
            
            data.forEach(s => s.attendanceStatus = 'present');

            const studentIds = data.map(s => s.numero);
            if (studentIds.length > 0) {
                try {
                    const rseResponse = await fetch("http://localhost:3000/rse/list", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ids: studentIds }),
                        credentials: "include"
                    });
                    
                    if (rseResponse.ok) {
                        const rseMap = await rseResponse.json();
                        data.forEach(s => {
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
            alert("Veuillez sélectionner une matière.");
            return;
        }
        if (!dateTime.date || !dateTime.startTime || !dateTime.endTime) {
            alert("Veuillez vérifier la date et l'heure.");
            return;
        }
        
        // Filter for absent students
        const absentStudents = [];
        gridApi.forEachNode((node) => {
            if (node.data.attendanceStatus === 'absent') {
                absentStudents.push(node.data);
            }
        });
        
        console.log("Absent students:", absentStudents);

        if (absentStudents.length === 0) {
            if(!confirm("Aucun absent sélectionné. Valider quand même (tout le monde présent) ?")) return;
        }

        const numberList = absentStudents.map(s => s.numero);
        const loginList = absentStudents.map(s => s.loginENT);

        const payload = {
            number: numberList,
            login: loginList,
            start: `${dateTime.date} ${dateTime.startTime}:00`,
            end: `${dateTime.date} ${dateTime.endTime}:00`,
            loginProf: user,
            code: subject
        };
        
        console.log("Sending Absence Payload:", payload);

        try {
            const response = await fetch("http://localhost:3000/absence/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            });
            
            if (response.ok) {
                alert("Appel validé avec succès !");
            } else {
                const errText = await response.text();
                alert("Erreur lors de la validation: " + errText);
            }
        } catch (err) {
            console.error(err);
            alert("Erreur réseau");
        }
    };

    if (!criteria) {
        return <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-secondary)" }}>Veuillez valider une sélection pour voir la liste.</div>;
    }

    return (
        <div style={{ marginTop: "2rem", maxWidth: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Liste d'appel</h2>
            <button 
                className="validate-btn" 
                style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
                onClick={handleValidateRollCall}
            >
                Valider l'appel
            </button>
        </div>

        {loading ? (
            <p>Chargement...</p>
        ) : (
            <div style={{ height: 500, width: "100%" }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                theme={theme === "dark" ? darkTheme : lightTheme}
                onGridReady={onGridReady}
                pagination={true}
                paginationPageSize={20}
                localeText={AG_GRID_LOCALE_FR}
            />
            </div>
        )}
        </div>
    );
}

export default RollCallList;