import React, { useEffect, useState, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { lightTheme, darkTheme } from "../../../constants/grid";
import { AG_GRID_LOCALE_FR } from "../../../constants/fr-FR";
import valueFormatter from "../../../functions/valueFormatter";
import RseCell from "./RseCell";
import { useTheme } from "../../../hooks/useTheme";
import { HEADER_DISPLAY_NAMES } from "../../../utils/studentValidation";
import "../../../style/Admin.css";
import { useUnsaved } from "../../../context/UnsavedContext";
import { useSafeNavigate } from "../../../hooks/useSafeNavigate";
import SearchInput from "../../common/SearchInput";
import "../../../style/searchAgGrid.css";
import { API_URL } from "../../../config";
import CustomLoader from "../../common/CustomLoader";

ModuleRegistry.registerModules([AllCommunityModule]);

function StudentList() {
    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setHasUnsavedChanges, hasUnsavedChanges } = useUnsaved();
    const [quickFilterText, setQuickFilterText] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);

    const safeNavigate = useSafeNavigate(hasUnsavedChanges);
    const theme = useTheme();



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

    async function handleFetchStudents() {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/eleve/all`, {
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
        handleFetchStudents();
    }, []);

    const handleRowClick = (event) => {
        safeNavigate(`/admin/detail-etudiant/${event.data.numero}`);
    };

    useEffect(() => {
        if (rowData && rowData.length > 0) {
            const firstObject = rowData[0];
            const generatedColumns = Object.keys(firstObject).map((key) => {
                if (key == "RSE") {
                    return {
                        headerName: key,
                        field: key,
                        cellRenderer: RseCell,
                        autoHeight: true,
                        resizable: true,
                        cellStyle: () => ({
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }),
                    };
                }
                return {
                    field: key,
                    headerName: HEADER_DISPLAY_NAMES[key] || key,
                    valueFormatter: valueFormatter,
                };
            });
            setColDefs(generatedColumns);
        }
    }, [rowData]);

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

    return (
        <div className="student-list">
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div className="search-wrapper-right" style={{ position: "relative", display: "flex", gap: "10px" }}>
                    <button
                        className="btn-icon"
                        onClick={() => safeNavigate("/admin/ajout?tab=student")}
                        title="Ajouter un étudiant"
                        style={{ color: "var(--primary-color)" }}
                    >
                        <span className="icon icon-add icon-xl"  title="Ajouter" />
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
                <div className="empty-state">Aucun étudiant trouvé.</div>
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
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 20, 50, 100]}
                        localeText={AG_GRID_LOCALE_FR}
                        quickFilterText={quickFilterText}
                    />
                </div>
            )}
        </div>
    );
}

export default StudentList;
