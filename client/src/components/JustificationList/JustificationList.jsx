import React, { useEffect, useState, useMemo, use } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { lightTheme, darkTheme } from "../../constants/grid";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
import valueFormatter from "../../functions/valueFormatter";
import { HEADER_DISPLAY_NAMES } from "../../utils/studentValidation";
import dateFormatter from "../../functions/dateFormatter";
import ValidationModal from "../ValidationJustification/ValidationView";
import { useTheme } from "../../hooks/useTheme";
ModuleRegistry.registerModules([AllCommunityModule]);

const columnOrder = [
  "numeroEtudiant",
  "nom",
  "prenom",
  "debut",
  "fin",
  "motif",
];

function JustificationList({ selectedId, setSelectedId }) {
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);
  const [loading, setLoading] = useState(false);

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

  async function handleFetchJustification() {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/justification/new", {
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
      const generatedColumns = columnOrder.map((key) => {
        if (key == "debut" || key == "fin") {
          return {
            headerName: HEADER_DISPLAY_NAMES[key] || key,
            field: key,
            valueFormatter: (params) => dateFormatter(params.value),
          };
        }
        return {
          headerName: HEADER_DISPLAY_NAMES[key] || key,
          field: key,
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

  const handleRowClick = (event) => {
    console.log(event.data);
    setSelectedId(event.data.idAbsJustifiee);
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        paddingRight: 10,
        paddingLeft: 10,
      }}
    >
      {loading ? (
        <p>En chargement...</p>
      ) : (
        <div className="justification-list-container" style={{ flex: 1 }}>
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
            onRowClicked={handleRowClick}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}
    </div>
  );
}

export default JustificationList;
