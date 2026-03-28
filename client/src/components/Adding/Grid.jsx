import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";
import { lightTheme, darkTheme } from "../../constants/grid";
import { useTheme } from "../../hooks/useTheme";
// import { CircleX } from "lucide-react";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
import { useIsMobile } from "../../hooks/useIsMobile";
ModuleRegistry.registerModules([AllCommunityModule]);

const Grid = ({ rowData, colDefs, gridRef, onRename, onDelete, onDeleteRow, onCellValueChanged }) => {
    const isMobile = useIsMobile();

    const defaultColDef = useMemo(
        () => ({
            editable: true,
            filter: true,
            flex: isMobile ? undefined : 1,
            suppressMovable: true,
        }),
        [isMobile],
    );

    const extendedColDefs = useMemo(() => {
        if (!colDefs) return [];
        return [
            {
                headerName: "",
                field: "actions",
                editable: false,
                filter: false,
                flex: isMobile ? undefined : 0.5,
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
                        <span className="icon icon-circle-x icon-xxl circle-x"  title="Fermer" />
                    </div>
                ),
            },
            ...colDefs,
        ];
    }, [colDefs]);

    // --- Rule to color the row if it's a duplicate ---
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
                // Adding the CSS rule for the rows
                rowClassRules={rowClassRules}
                localeText={AG_GRID_LOCALE_FR}
                autoSizeStrategy={isMobile ? { type: "fitCellContents" } : undefined}
            />
        </div>
    );
};

export default Grid;
