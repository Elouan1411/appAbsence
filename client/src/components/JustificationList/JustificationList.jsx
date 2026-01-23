import React, { useEffect, useState, useMemo, use } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { lightTheme, darkTheme } from "../../constants/grid";
import { AG_GRID_LOCALE_FR } from "../../constants/fr-FR";
import valueFormatter from "../../functions/valueFormatter";
import { HEADER_DISPLAY_NAMES } from "../../utils/studentValidation";
import dateFormatter, { parseDateValue } from "../../functions/dateFormatter";
import ValidationModal from "../ValidationJustification/ValidationView";
import { useTheme } from "../../hooks/useTheme";
import { motif_translation } from "../../constants/motif_translation";
import firstCharUppercase from "../../functions/firstCharUppercase";
import SearchInput from "../common/SearchInput";
import { API_URL } from "../../config";
import "../../style/searchAgGrid.css";
ModuleRegistry.registerModules([AllCommunityModule]);

const columnOrder = ["numeroEtudiant", "nom", "prenom", "debut", "fin", "motif", "commentaire"];

function JustificationList({ selectedItem, setSelectedItem, reload }) {
    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [quickFilterText, setQuickFilterText] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);

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
            wrapText: false,
            autoHeight: false,
            floatingFilter: isSearchActive,
        };
    }, [isSearchActive]);

    const isFirstLoad = React.useRef(true);

    async function handleFetchJustification() {
        try {
            // Only show loading spinner on the very first load
            if (isFirstLoad.current) {
                setLoading(true);
            }

            const response = await fetch(`${API_URL}/justification/new`, {
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
                    const commentaire = firstCharUppercase(subMotif[1] || "").trim() || "";

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

            if (JSON.stringify(processedData) !== JSON.stringify(rowData)) {
                setRowData(processedData);

                // Smart Selection Clearing - Only check if data changed
                if (selectedItem) {
                    const stillExists = processedData.find((item) => item.idAbsJustifiee === selectedItem.idAbsJustifiee);
                    if (!stillExists) {
                        setSelectedItem(null);
                    }
                }
            }
        } catch (err) {
            console.error("Erreur de fetch: " + err.message);
        } finally {
            setLoading(false);
            isFirstLoad.current = false;
        }
    }

    useEffect(() => {
        handleFetchJustification();
    }, [reload]);

    useEffect(() => {
        if (rowData && rowData.length > 0) {
            const generatedColumns = columnOrder.map((key) => {
                if (key == "debut" || key == "fin") {
                    return {
                        headerName: HEADER_DISPLAY_NAMES[key] || key,
                        field: key,
                        valueFormatter: (params) => dateFormatter(params.value),
                        getQuickFilterText: (params) => dateFormatter(params.value),
                        filter: "agDateColumnFilter",
                        filterParams: {
                            comparator: (filterLocalDateAtMidnight, cellValue) => {
                                const cellDate = parseDateValue(cellValue);
                                if (!cellDate) return -1;

                                const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
                                const filterDateOnly = new Date(
                                    filterLocalDateAtMidnight.getFullYear(),
                                    filterLocalDateAtMidnight.getMonth(),
                                    filterLocalDateAtMidnight.getDate(),
                                );

                                if (cellDateOnly.getTime() === filterDateOnly.getTime()) {
                                    return 0;
                                }
                                if (cellDateOnly < filterDateOnly) {
                                    return -1;
                                }
                                if (cellDateOnly > filterDateOnly) {
                                    return 1;
                                }
                            },
                        },
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

    const toggleSearch = () => {
        if (isSearchActive) {
            setQuickFilterText("");
        }
        setIsSearchActive(!isSearchActive);
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
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                <div className="search-wrapper-right" style={{ position: "relative" }}>
                    {isSearchActive ? (
                        <SearchInput
                            value={quickFilterText}
                            onChange={(e) => setQuickFilterText(e.target.value)}
                            placeholder="Rechercher..."
                            onIconClick={toggleSearch}
                        />
                    ) : (
                        <button onClick={toggleSearch} className="search-toggle-button">
                            <span className="icon icon-search search-icon-sized" />
                        </button>
                    )}
                </div>
            </div>
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
                        quickFilterText={quickFilterText}
                    />
                </div>
            )}
        </div>
    );
}

export default JustificationList;
