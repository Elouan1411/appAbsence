import React, { useEffect, useState, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { lightTheme, darkTheme } from "../../../constants/grid";
import { AG_GRID_LOCALE_FR } from "../../../constants/fr-FR";
import valueFormatter from "../../../functions/valueFormatter";
import RseCell from "../StudentList/RseCell";
import { useTheme } from "../../../hooks/useTheme";
import { HEADER_DISPLAY_NAMES } from "../../../utils/teacherValidation";
import "../../../style/Admin.css";
import { useUnsaved } from "../../../context/UnsavedContext";
import { useSafeNavigate } from "../../../hooks/useSafeNavigate";
import SearchInput from "../../common/SearchInput";
import "../../../style/searchAgGrid.css";
import { API_URL } from "../../../config";
import CustomLoader from "../../common/CustomLoader";
import toast from "react-hot-toast";
import { alertConfirm } from "../../../hooks/alertConfirm";

ModuleRegistry.registerModules([AllCommunityModule]);

function TeacherList() {
    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setHasUnsavedChanges, hasUnsavedChanges } = useUnsaved();
    const [quickFilterText, setQuickFilterText] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);

    const safeNavigate = useSafeNavigate(hasUnsavedChanges);
    const theme = useTheme();

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

    async function handleFetchStudents() {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/teacher/all`, {
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

    const handleDelete = async (loginENT, nom, prenom) => {
        if (await alertConfirm("Êtes-vous sûr ?", `Supprimer l'enseignant ${prenom} ${nom} ?`)) {
            try {
                const response = await fetch(`${API_URL}/teacher/${loginENT}`, {
                    method: "DELETE",
                    credentials: "include",
                });

                if (response.ok) {
                    toast.success("Enseignant supprimé avec succès");
                    handleFetchStudents();
                } else {
                    const errorData = await response.json();
                    toast.error(errorData.error || "Erreur lors de la suppression");
                }
            } catch (err) {
                console.error(err);
                toast.error("Erreur réseau");
            }
        }
    };

    useEffect(() => {
        if (rowData && rowData.length > 0) {
            const firstObject = rowData[0];
            const generatedColumns = Object.keys(firstObject).map((key) => {
                const colDef = {
                    field: key,
                    headerName: HEADER_DISPLAY_NAMES[key] || key,
                    valueFormatter: valueFormatter,
                };

                if (key === "administrateur") {
                    colDef.cellRenderer = (params) => {
                        if (params.value === 1 || params.value === true) {
                            return <span className="role-badge admin">Administrateur</span>;
                        }
                        return <span className="role-badge teacher">Enseignant</span>;
                    };
                }
                colDef.cellStyle = { display: "flex", alignItems: "center" };
                return colDef;
            });

            generatedColumns.push({
                headerName: "Actions",
                field: "actions",
                cellRenderer: (params) => (
                    <div style={{ display: "flex", justifyContent: "center", width: "100%", gap: "10px" }}>
                        <button
                            className="btn-icon edit-button"
                            onClick={() => safeNavigate(`/admin/detail-enseignant/${params.data.loginENT}`)}
                            title="Modifier"
                            style={{ color: "var(--primary-color, #3b82f6)" }}
                        >
                            <span className="icon icon-edit icon-xl" />
                        </button>
                        <button
                            className="btn-icon delete-button"
                            onClick={() => handleDelete(params.data.loginENT, params.data.nom, params.data.prenom)}
                            title="Supprimer"
                            style={{ color: "var(--error-color, #ef4444)" }}
                        >
                            <span className="icon icon-trash icon-xl" />
                        </button>
                    </div>
                ),
                width: 140,
                sortable: false,
                filter: false,
                resizable: false,
                cellStyle: { display: "flex", justifyContent: "center", alignItems: "center" },
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
                <div className="search-wrapper-right" style={{ position: "relative" }}>
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
                <div className="empty-state">Aucun enseignant trouvé.</div>
            ) : (
                <div style={{ height: "100%", width: "100%" }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={colDefs}
                        defaultColDef={defaultColDef}
                        theme={theme == "dark" ? darkTheme : lightTheme}
                        rowSelection={rowSelection}
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 20, 50, 100]}
                        localeText={AG_GRID_LOCALE_FR}
                        autoSizeStrategy={autoSizeStrategy}
                        quickFilterText={quickFilterText}
                    />
                </div>
            )}
        </div>
    );
}

export default TeacherList;
