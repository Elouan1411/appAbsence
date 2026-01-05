import React, { useEffect, useState, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { lightTheme, darkTheme } from "../../constants/grid";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
import valueFormatter from "../../functions/valueFormatter";

ModuleRegistry.registerModules([AllCommunityModule]);

function JustificationList() {
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = sessionStorage.getItem("theme");

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

  async function handleFetchJustification() {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/justification/", {
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
    handleFetchJustification();
  }, []);

  useEffect(() => {
    if (rowData && rowData.length > 0) {
      const firstObject = rowData[0];
      const generatedColumns = Object.keys(firstObject).map((key) => {
        return {
          field: key,
          headerName: key,
          // valueFormatter: valueFormatter,
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
    <div style={{ padding: 20 }}>
      {loading ? (
        <p>En chargement...</p>
      ) : (
        <div style={{ height: 600, width: "100%" }}>
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
          />
        </div>
      )}
    </div>
  );
}

export default JustificationList;
