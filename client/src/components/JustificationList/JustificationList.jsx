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
import { motif_translation } from "../../constants/motif_translation";
import firstCharUppercase from "../../functions/firstCharUppercase";
ModuleRegistry.registerModules([AllCommunityModule]);

const columnOrder = ["numeroEtudiant", "nom", "prenom", "debut", "fin", "motif", "commentaire"];

function JustificationList({ selectedId, setSelectedItem, reload }) {
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
            console.log(result);
            const processedData = result.map((item) => {
                if (item.liste_creneaux && item.liste_creneaux.length > 0) {
                    let new_creneaux = JSON.parse(item.liste_creneaux);
                    const sortedByStart = [...new_creneaux].sort((a, b) => new Date(a.debut) - new Date(b.debut));
                    console.log(sortedByStart);

                    const sortedByEnd = [...new_creneaux].sort((a, b) => new Date(b.fin) - new Date(a.fin));

                    const subMotif = item.motif.split("|");
                    const motifTitle = motif_translation[subMotif[0].trim()] || subMotif[0].trim();
                    const commentaire = firstCharUppercase(subMotif[1]).trim();

                    return {
                        ...item,
                        debut: sortedByStart[0].debut,
                        fin: sortedByEnd[0].fin,
                        liste_creneaux: new_creneaux,
                        motif: motifTitle,
                        commentaire: commentaire,
                    };
                }

                return item;
            });

            console.log("Données traitées :", processedData);
            setRowData(processedData);
        } catch (err) {
            console.error("Erreur de fetch: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handleFetchJustification();
        setSelectedItem(null);
    }, [reload]);

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
        setSelectedItem(event.data);
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
