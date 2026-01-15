import React, { useEffect, useState, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { lightTheme, darkTheme } from "../../constants/grid";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
import valueFormatter from "../../functions/valueFormatter";
import RseCell from "./RseCell";
import { useTheme } from "../../hooks/useTheme";
import { HEADER_DISPLAY_NAMES } from "../../utils/studentValidation";
import "../../style/Admin.css";
import { useUnsaved } from "../../context/UnsavedContext";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";

ModuleRegistry.registerModules([AllCommunityModule]);

function StudentList() {
    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setHasUnsavedChanges, hasUnsavedChanges } = useUnsaved();

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
        };
    }, []);

    async function handleFetchStudents() {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3000/eleve/all", {
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
        console.log(event.data);
        safeNavigate(`/admin/studentdetail/${event.data.numero}`);
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

    console.log(rowData);

    return (
        <div className="student-list">
            {loading ? (
                <p>En chargement...</p>
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
                        autoSizeStrategy={autoSizeStrategy}
                    />
                </div>
            )}
        </div>
    );
}

export default StudentList;
