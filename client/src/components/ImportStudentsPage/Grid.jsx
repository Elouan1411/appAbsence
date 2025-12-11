import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo } from "react";
import { lightTheme } from "../../constants/grid";

ModuleRegistry.registerModules([AllCommunityModule]);

// Ajout de 'gridRef' dans les props
const Grid = ({ rowData, colDefs, gridRef }) => {
  const defaultColDef = useMemo(
    () => ({
      editable: true, // Important : permet l'édition
      filter: true,
      flex: 1,
    }),
    []
  );

  return (
    <div style={{ height: 500, width: "100%" }}>
      <AgGridReact
        ref={gridRef} // On attache la référence ici
        theme={lightTheme}
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
      />
    </div>
  );
};

export default Grid;
