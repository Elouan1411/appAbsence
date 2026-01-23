import React, { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import "../../style/Admin.css";
import "../../style/Teacher.css";
import { useAuth } from "../../hooks/useAuth";
import PageTitle from "../../components/common/PageTitle";
import { useTheme } from "../../hooks/useTheme";
import { lightTheme, darkTheme } from "../../constants/grid";
import RollCallList from "../../components/Teacher/RollCallList";
import BackButton from "../../components/common/BackButton";
import toast from "react-hot-toast";
import { alertConfirm } from "../../hooks/alertConfirm";
import SearchInput from "../../components/common/SearchInput";
import "../../style/icon.css";
import "../../style/searchAgGrid.css";
import "../../style/StudentDetail.css";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";

ModuleRegistry.registerModules([AllCommunityModule]);

function TeacherHistoryPage() {
    const { user, role } = useAuth();
    const [rowData, setRowData] = useState([]);
    const [selectedCall, setSelectedCall] = useState(null);
    const [quickFilterText, setQuickFilterText] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);
    const theme = useTheme();

    const parseDateValue = (value) => {
        if (!value) return null;
        const valueStr = String(value);

        if (valueStr.length >= 12 && !valueStr.includes("-")) {
            const year = parseInt(valueStr.substring(0, 4), 10);
            const month = parseInt(valueStr.substring(4, 6), 10) - 1;
            const day = parseInt(valueStr.substring(6, 8), 10);
            const hour = parseInt(valueStr.substring(8, 10), 10);
            const min = parseInt(valueStr.substring(10, 12), 10);
            const date = new Date(year, month, day, hour, min);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }
        return null;
    };

    const fetchHistory = async () => {
        if (!user) return;
        try {
            const response = await fetch(`http://localhost:3000/appel/:${user}`, {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setRowData(data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'historique:", error);
        }
    };

    const fetchHistoryAdmin = async () => {
        if (!user) return;
        try {
            const response = await fetch(`http://localhost:3000/appel/all`, {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setRowData(data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'historique:", error);
        }
    };

    useEffect(() => {
        if (role == "admin") {
            fetchHistoryAdmin();
        } else {
            fetchHistory();
        }
    }, [role]);

    const handleRowClick = (event) => {
        if (event.event && event.event.target && event.event.target.closest(".delete-button")) {
            return;
        }

        const callData = event.data;
        const groupData = {
            promo: callData.promo,
            groupeTD: callData.groupeTD,
            groupeTP: callData.groupeTP,
            semestre: callData.libelle.includes("S1") || callData.libelle.includes("S3") || callData.libelle.includes("S5") ? "1" : "2",
        };
        setSelectedCall({ callId: callData.idAppel, callData, groupData });
    };

    const handleBack = () => {
        setSelectedCall(null);
    };

    const handleSuccess = () => {
        setSelectedCall(null);
        if (role == "admin") {
            fetchHistoryAdmin();
        } else {
            fetchHistory();
        }
    };

    const handleDelete = async (callId, libelle) => {
        if (await alertConfirm("Êtes-vous sûr ?", `Supprimer l'appel de ${libelle} ?`)) {
            try {
                const response = await fetch(`http://localhost:3000/appel/${callId}`, {
                    method: "DELETE",
                    credentials: "include",
                });
                if (response.ok) {
                    toast.success("Appel supprimé avec succès");
                    if (role == "admin") {
                        fetchHistoryAdmin();
                    } else {
                        fetchHistory();
                    }
                } else {
                    toast.error("Erreur lors de la suppression");
                }
            } catch (err) {
                console.error(err);
                toast.error("Erreur réseau");
            }
        }
    };

    const ActionRenderer = (params) => {
        return (
            <div className="right-buttons-container" style={{ width: "100%", justifyContent: "center" }}>
                <button
                    className="delete-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(params.data.idAppel, params.data.libelle);
                    }}
                >
                    <span className="icon icon-trash" />
                </button>
            </div>
        );
    };

    const columnDefs = useMemo(() => {
        const cols = [
            {
                headerName: "Date",
                field: "debut",
                cellDataType: "dateTime",
                valueFormatter: (params) => {
                    if (!params.value) return "";
                    const date = parseDateValue(params.value);
                    return date ? format(date, "dd/MM/yyyy HH:mm", { locale: fr }) : String(params.value);
                },
                getQuickFilterText: (params) => {
                    if (!params.value) return "";
                    const date = parseDateValue(params.value);
                    return date ? format(date, "dd/MM/yyyy HH:mm", { locale: fr }) : String(params.value);
                },
                minWidth: 160,
                filter: "agDateColumnFilter",
                filterParams: {
                    comparator: (filterLocalDateAtMidnight, cellValue) => {
                        const cellDate = parseDateValue(cellValue);
                        if (!cellDate) return -1;

                        const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
                        const filterDateOnly = new Date(
                            filterLocalDateAtMidnight.getFullYear(),
                            filterLocalDateAtMidnight.getMonth(),
                            filterLocalDateAtMidnight.getDate(),
                        );

                        if (cellDateOnly.getTime() === filterDateOnly.getTime()) {
                            return 0;
                        }
                        if (cellDateOnly < filterDateOnly) {
                            return -1;
                        }
                        if (cellDateOnly > filterDateOnly) {
                            return 1;
                        }
                    },
                },
                sortable: true,
                sort: "desc",
            },
        ];

        if (role === "admin") {
            cols.push({
                headerName: "Professeur",
                valueGetter: (params) => {
                    if (params.data && params.data.nom && params.data.prenom) {
                        return `${params.data.nom.toUpperCase()} ${params.data.prenom}`;
                    }
                    return params.data ? params.data.loginProfesseur : "";
                },
                filter: true,
                flex: 1,
            });
        }

        cols.push(
            {
                field: "libelle",
                headerName: "Matière",
                filter: true,
                flex: 1,
            },
            {
                field: "promo",
                headerName: "Promo",
                filter: true,
                width: 100,
            },
            {
                field: "groupeTD",
                headerName: "TD",
                filter: true,
                width: 100,
            },
            {
                field: "groupeTP",
                headerName: "TP",
                filter: true,
                width: 100,
            },
            {
                headerName: "Actions",
                cellRenderer: ActionRenderer,
                width: 100,
                sortable: false,
                filter: false,
                cellStyle: { display: "flex", justifyContent: "center", alignItems: "center" },
            },
        );

        return cols;
    }, [role]);

    const defaultColDef = useMemo(
        () => ({
            resizable: true,
            sortable: true,
            filter: true,
            floatingFilter: isSearchActive,
        }),
        [isSearchActive],
    );

    const getParsedDateTime = (callData) => {
        if (!callData) return { date: "", startTime: "", endTime: "" };
        const strStart = String(callData.debut);
        const strEnd = String(callData.fin);

        const parse = (str) => {
            if (!str || str.length < 12) return { date: "", time: "" };
            const year = str.substring(0, 4);
            const month = str.substring(4, 6);
            const day = str.substring(6, 8);
            const hour = str.substring(8, 10);
            const min = str.substring(10, 12);
            return { date: `${year}-${month}-${day}`, time: `${hour}:${min}` };
        };
        const start = parse(strStart);
        const end = parse(strEnd);
        return { date: start.date, startTime: start.time, endTime: end.time };
    };

    if (selectedCall) {
        const dateTime = getParsedDateTime(selectedCall.callData);
        return (
            <div className="page-container">
                <div className="page-header">
                    <BackButton onClick={handleBack} label="" />
                    <PageTitle title={`Modifier l'appel - ${selectedCall.callData.libelle}`} icon="icon-rollcall" />
                </div>
                <RollCallList
                    criteria={selectedCall.groupData}
                    dateTime={dateTime}
                    subject={selectedCall.callData.codeMatiere ?? selectedCall.callData.code}
                    callId={selectedCall.callId}
                    loginENT={selectedCall.callData.loginProfesseur}
                    onSuccess={handleSuccess}
                />
            </div>
        );
    }

    const onSortChanged = (params) => {
        const sortModel = params.api.getColumnState().filter((s) => s.sort);
        const dateSort = sortModel.find((s) => s.colId === "debut");

        if (!dateSort) {
            params.api.applyColumnState({
                state: [...sortModel, { colId: "debut", sort: "desc", sortIndex: sortModel.length }],
            });
        }
    };

    const toggleSearch = () => {
        if (isSearchActive) {
            setQuickFilterText("");
        }
        setIsSearchActive(!isSearchActive);
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <PageTitle title="Historique des Appels" icon="icon-history" />
            </div>
            <div className="search-wrapper-right">
                {isSearchActive ? (
                    <SearchInput
                        value={quickFilterText}
                        onChange={(e) => setQuickFilterText(e.target.value)}
                        placeholder="Rechercher dans l'historique..."
                        onIconClick={toggleSearch}
                    />
                ) : (
                    <button onClick={toggleSearch} className="search-toggle-button">
                        <span className="icon icon-search search-icon-sized" />
                    </button>
                )}
            </div>
            <div className="grid-container">
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    theme={theme === "dark" ? darkTheme : lightTheme}
                    pagination={true}
                    paginationPageSize={16}
                    onRowClicked={handleRowClick}
                    rowStyle={{ cursor: "pointer" }}
                    domLayout="autoHeight"
                    onSortChanged={onSortChanged}
                    quickFilterText={quickFilterText}
                    localeText={AG_GRID_LOCALE_FR}
                />
            </div>
        </div>
    );
}

export default TeacherHistoryPage;
