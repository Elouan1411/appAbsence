import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";
import { lightTheme, darkTheme } from "../../constants/grid";
import { useTheme } from "../../hooks/useTheme";
// import { CircleX } from "lucide-react";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
ModuleRegistry.registerModules([AllCommunityModule]);

const Grid = ({ rowData, colDefs, gridRef, onRename, onDelete, onDeleteRow, onCellValueChanged }) => {
    const defaultColDef = useMemo(
        () => ({
            editable: true,
            filter: true,
            flex: 1,
            suppressMovable: true,
        }),
        [],
    );

    const extendedColDefs = useMemo(() => {
        if (!colDefs) return [];
        return [
            {
                headerName: "",
                field: "actions",
                editable: false,
                filter: false,
                flex: 0.5,
                cellRenderer: (params) => (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            cursor: "pointer",
                        }}
                        onClick={() => params.context.onDeleteRow(params.node.rowIndex)}
                    >
                        {/* <CircleX className="circle-x" /> */}
                        <span className="icon icon-circle-x circle-x" style={{ width: 24, height: 24, backgroundColor: "currentColor" }} />
                    </div>
                ),
            },
            ...colDefs,
        ];
    }, [colDefs]);

    // --- Règle pour colorer la ligne si c'est un doublon ---
    const rowClassRules = useMemo(() => {
        return {
            "row-duplicate-db": (params) => {
                return params.data && params.data._isDuplicate;
            },
        };
    }, []);

    const theme = useTheme();

    return (
        <div style={{ height: 500, width: "100%" }}>
            <AgGridReact
                ref={gridRef}
                theme={theme === "dark" ? darkTheme : lightTheme}
                rowData={rowData}
                columnDefs={extendedColDefs}
                defaultColDef={defaultColDef}
                context={{ onRename, onDelete, onDeleteRow }}
                onCellValueChanged={onCellValueChanged}
                tooltipShowDelay={600}
                // Ajout de la règle CSS pour les lignes
                rowClassRules={rowClassRules}
                localeText={AG_GRID_LOCALE_FR}
            />
        </div>
    );
};

export default Grid;
