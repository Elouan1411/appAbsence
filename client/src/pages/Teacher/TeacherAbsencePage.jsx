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
import toast from "react-hot-toast";
import "../../style/icon.css";
import "../../style/StudentDetail.css";
import { alertConfirm } from "../../hooks/alertConfirm";
import { lightTheme, darkTheme } from "../../constants/grid";
import { parseDateValue } from "../../functions/dateFormatter";
import SearchInput from "../../components/common/SearchInput";
import "../../style/searchAgGrid.css";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
import { API_URL } from "../../config";
import CustomLoader from "../../components/common/CustomLoader";
ModuleRegistry.registerModules([AllCommunityModule]);

function TeacherHistoryPage() {
    const { user } = useAuth();
    const [rowData, setRowData] = useState([]);
    const [quickFilterText, setQuickFilterText] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();

    const fetchHistory = async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/absence/history/:${user}`, {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setRowData(data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'historique:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const JustificationRenderer = (params) => {
        const { validite, motif, motifValidite } = params.data;

        const Icon = ({ name, color }) => (
            <span
                className={`icon icon-${name}`}
                style={{
                    width: 20,
                    height: 20,
                    backgroundColor: color,
                }}
            />
        );

        let icon = <Icon name="x" color="red" />;
        let statusText = "Non justifiée";
        let tooltip = "Aucune justification soumise";

        if (validite === 2) {
            icon = <Icon name="history" color="orange" />;
            statusText = "En attente";
            tooltip = `Motif étudiant : ${motif}`;
        } else if (validite === 1) {
            icon = <Icon name="check_success" color="green" />;
            statusText = "Justifiée";
            tooltip = `Motif validé : ${motifValidite || motif}`;
        } else if (validite === 0 && motif) {
            icon = <Icon name="notification" color="red" />;
            statusText = "Refusée";
            tooltip = `Justification refusée. Motif refus : ${motifValidite}`;
        }

        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "help",
                }}
                title={tooltip}
            >
                {icon}
                <span>{statusText}</span>
            </div>
        );
    };

    const ActionRenderer = (params) => {
        const handleDelete = async () => {
            if (await alertConfirm("Êtes-vous sûr ?", `Supprimer l'absence de ${params.data.prenom} ${params.data.nom} ?`)) {
                try {
                    const response = await fetch(`${API_URL}/absence`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: params.data.numeroEtudiant,
                            loginProf: user,
                            debut: params.data.debut,
                            fin: params.data.fin,
                            idAppel: params.data.idAppel,
                        }),
                        credentials: "include",
                    });
                    if (response.ok) {
                        toast.success("Absence supprimée avec succès");
                        fetchHistory();
                    } else {
                        toast.error("Erreur lors de la suppression");
                    }
                } catch (err) {
                    console.error(err);
                    toast.error("Erreur réseau");
                }
            }
        };

        return (
            <div className="right-buttons-container" style={{ width: "100%", justifyContent: "center" }}>
                <button
                    className="delete-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}
                >
                    <span className="icon icon-trash icon-xl" />
                </button>
            </div>
        );
    };

    const columnDefs = useMemo(
        () => [
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
            {
                field: "nomMatiere",
                headerName: "Matière",
                filter: true,
                width: 250,
            },
            { field: "nom", headerName: "Nom", filter: true },
            { field: "prenom", headerName: "Prénom", filter: true },
            { field: "motif", headerName: "Motif", filter: true, flex: 1 },
            {
                headerName: "Justification",
                cellRenderer: JustificationRenderer,
                minWidth: 200,
                sortable: true,
                comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
                    const getStatusRank = (data) => {
                        const { validite, motif } = data;
                        if (validite === 2) return 2;
                        if (validite === 1) return 3;
                        if (validite === 0 && motif) return 1;
                        return 0;
                    };
                    const rankA = getStatusRank(nodeA.data);
                    const rankB = getStatusRank(nodeB.data);
                    if (rankA === rankB) return 0;
                    return rankA > rankB ? 1 : -1;
                },
            },
            {
                headerName: "Actions",
                cellRenderer: ActionRenderer,
                width: 100,
                cellStyle: { display: "flex", justifyContent: "center", alignItems: "center" },
            },
        ],
        [user],
    );

    const defaultColDef = useMemo(
        () => ({
            resizable: true,
            sortable: true,
            floatingFilter: isSearchActive,
        }),
        [isSearchActive],
    );

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
                <PageTitle title="Historique des Absences" icon="icon-absences" />
            </div>
            <div className="search-wrapper-right">
                {isSearchActive ? (
                    <SearchInput
                        value={quickFilterText}
                        onChange={(e) => setQuickFilterText(e.target.value)}
                        placeholder="Rechercher..."
                        onIconClick={toggleSearch}
                    />
                ) : (
                    <button onClick={toggleSearch} className="search-toggle-button">
                        <span className="icon icon-search search-icon-sized" />
                    </button>
                )}
            </div>
            <div className="grid-container">
                {isLoading ? (
                    <CustomLoader />
                ) : (
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        theme={theme === "dark" ? darkTheme : lightTheme}
                        pagination={true}
                        paginationPageSize={100}
                        domLayout="autoHeight"
                        onSortChanged={onSortChanged}
                        quickFilterText={quickFilterText}
                        localeText={AG_GRID_LOCALE_FR}
                    />
                )}
            </div>
        </div>
    );
}

export default TeacherHistoryPage;
