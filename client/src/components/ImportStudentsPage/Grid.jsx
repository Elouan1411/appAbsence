import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";
import { lightTheme } from "../../constants/grid";

ModuleRegistry.registerModules([AllCommunityModule]);

const Grid = ({ rowData, colDefs, gridRef, onRename, onCellValueChanged }) => {
  const defaultColDef = useMemo(
    () => ({
      editable: true,
      filter: true,
      flex: 1,
      suppressMovable: true,
    }),
    []
  );

  return (
    <div style={{ height: 500, width: "100%" }}>
      <AgGridReact
        ref={gridRef}
        theme={lightTheme}
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        context={{ onRename }} 
        onCellValueChanged={onCellValueChanged} 
      />
    </div>
  );
};

export default Grid;
