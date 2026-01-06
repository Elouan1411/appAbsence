import React, { useEffect, useState, useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { lightTheme, darkTheme } from "../../constants/grid";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
import RseCell from "../StudentList/RseCell";
import "../../style/SelectGroups.css"; 

ModuleRegistry.registerModules([AllCommunityModule]);

function RollCallList({ criteria }) {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = sessionStorage.getItem("theme");

  const colDefs = useMemo(() => {
    const isPair = criteria?.semestre === "1";
    return [
      {
        field: "numero",
        headerName: "Numéro",
        minWidth: 120,
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      { field: "nom", headerName: "Nom", minWidth: 150 },
      { field: "prenom", headerName: "Prénom", minWidth: 150 },
      { field: isPair ? "groupeTDPair" : "groupeTD", headerName: "TD", minWidth: 100 },
      { field: isPair ? "groupeTPPair" : "groupeTP", headerName: "TP", minWidth: 100 },
      {
        headerName: "RSE",
        field: "RSE",
        cellRenderer: RseCell,
        autoHeight: true,
        resizable: true,
        minWidth: 250,
      },
    ];
  }, [criteria]);

  const defaultColDef = useMemo(() => ({
    flex: 1,
    filter: true,
    sortable: true,
    resizable: true,
  }), []);

  useEffect(() => {
    async function fetchStudents() {
      if (!criteria || !criteria.promo) return;

      setLoading(true);
      try {
        const pairParam = criteria.semestre === "1" ? "1" : "0";

        const response = await fetch(`http://localhost:3000/groups/${pairParam}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            promo: criteria.promo,
            groupeTD: criteria.groupeTD,
            groupeTP: criteria.groupeTP
          }),
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          
          const studentIds = data.map(s => s.numero);
          if (studentIds.length > 0) {
              try {
                  const rseResponse = await fetch("http://localhost:3000/rse/list", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ids: studentIds }),
                      credentials: "include"
                  });
                  
                  if (rseResponse.ok) {
                      const rseMap = await rseResponse.json();
                      data.forEach(s => {
                          s.RSE = rseMap[s.numero] || null;
                      });
                  }
              } catch (e) {
                  console.error("Error fetching RSE:", e);
              }
          }

          console.log("Students with RSE:", data);
          setRowData(data);
        } else {
          console.error("Error fetching students:", response.status);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [criteria]);

  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    console.log("Présents:", selectedRows);
  };

  if (!criteria) {
    return <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-secondary)" }}>Veuillez valider une sélection pour voir la liste.</div>;
  }

  return (
    <div style={{ marginTop: "2rem", maxWidth: "100%" }}>
      <h2>Liste d'appel</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div style={{ height: 500, width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            theme={theme === "dark" ? darkTheme : lightTheme}
            rowSelection="multiple"
            onSelectionChanged={onSelectionChanged}
            pagination={true}
            paginationPageSize={20}
            localeText={AG_GRID_LOCALE_FR}
          />
        </div>
      )}
    </div>
  );
}

export default RollCallList;