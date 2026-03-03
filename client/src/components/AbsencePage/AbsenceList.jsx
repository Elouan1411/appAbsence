import React from "react";
import { useState, useMemo } from "react";
import { useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { useTheme } from "../../hooks/useTheme";
import { darkTheme, lightTheme } from "../../constants/grid";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
import ABSENCE_HEADER_DISPLAY_NAMES from "../../constants/ABSENCE_HEADER_DISPLAY_NAMES";
import valueFormatter from "../../functions/valueFormatter";
import SearchInput from "../common/SearchInput";
import dateFormatter from "../../functions/dateFormatter";
import CustomLoader from "../common/CustomLoader";
import JustifieCell from "./JustifieCell";
import { useUnsaved } from "../../context/UnsavedContext";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";
import { API_URL } from "../../config";
import "../../style/AbsencePage.css";

function AbsenceList() {
    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [quickFilterText, setQuickFilterText] = useState("");
    const [loading, setLoading] = useState(false);

    const { hasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    const columns = ["eleve", "debut", "fin", "libelle", "professeur", "promo", "groupeTD", "groupeTP", "validite"];

    const theme = useTheme();

    async function handleFetchAbsences() {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/absence/all`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) throw new Error("Erreur HTTP " + response.status);

            const result = await response.json();
            setRowData(result);
        } catch (err) {
            console.error("Erreur de fetch: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handleFetchAbsences();
    }, []);

    const handleRowClick = (event) => {
        safeNavigate(`/admin/detail-absence/${event.data.idAbsence}`);
    };
    const autoSizeStrategy = useMemo(() => {
        return {
            type: "fitCellContents",
            skipHeader: true,
            scaleUpToFitGridWidth: true,
        };
    }, []);

    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true,
            wrapText: true,
            autoHeight: true,
            floatingFilter: isSearchActive,
        };
    }, [isSearchActive]);

    const rowSelection = useMemo(() => {
        return {
            mode: "multiRow",
        };
    }, []);

    const toggleSearch = () => {
        if (isSearchActive) {
            setQuickFilterText("");
        }
        setIsSearchActive(!isSearchActive);
    };

    useEffect(() => {
        if (rowData && rowData.length > 0) {
            const generatedColumns = columns.map((key) => {
                if (key === "validite") {
                    return {
                        headerName: ABSENCE_HEADER_DISPLAY_NAMES[key] || key,
                        field: "validite",
                        cellRenderer: JustifieCell,
                        autoHeight: true,
                        resizable: true,
                        cellStyle: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        },
                        comparator: (valueA, valueB) => (valueA || 99) - (valueB || 99),
                    };
                }

                if (key === "debut") {
                    return {
                        field: key,
                        headerName: ABSENCE_HEADER_DISPLAY_NAMES[key] || key,
                        valueFormatter: (params) => dateFormatter(params.value),
                        sort: "asc",
                        sortIndex: 1,
                    };
                }

                if (key === "fin") {
                    return {
                        field: key,
                        headerName: ABSENCE_HEADER_DISPLAY_NAMES[key] || key,
                        valueFormatter: (params) => dateFormatter(params.value),
                    };
                }

                return {
                    field: key,
                    headerName: ABSENCE_HEADER_DISPLAY_NAMES[key] || key,
                    valueFormatter: valueFormatter,
                };
            });
            setColDefs(generatedColumns);
        }
    }, [rowData]);

    return (
        <div className="absence-list-container">
            <div className="search-wrapper-container">
                <div className="search-wrapper-right" style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                        className="btn-icon"
                        onClick={handleFetchAbsences}
                        title="Actualiser"
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                        <span className="icon icon-refresh icon-xl"  title="Actualiser" />
                    </button>
                    <SearchInput
                        value={quickFilterText}
                        onChange={(e) => setQuickFilterText(e.target.value)}
                        placeholder="Rechercher..."
                        onIconClick={toggleSearch}
                    />
                </div>
            </div>
            {loading ? (
                <CustomLoader />
            ) : rowData.length === 0 ? (
                <div className="empty-state" style={{ width: "100%" }}>
                    Aucune absence à afficher
                </div>
            ) : (
                <div style={{ height: "100%", width: "100%" }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={colDefs}
                        defaultColDef={defaultColDef}
                        theme={theme == "dark" ? darkTheme : lightTheme}
                        rowSelection={rowSelection}
                        onRowClicked={handleRowClick}
                        pagination={true}
                        paginationPageSize={16}
                        paginationPageSizeSelector={[10, 20, 50, 100]}
                        localeText={AG_GRID_LOCALE_FR}
                        quickFilterText={quickFilterText}
                    />
                </div>
            )}
        </div>
    );
}

export default AbsenceList;
