import React, { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import "../../style/Admin.css";
import { useAuth } from "../../hooks/useAuth";
import Title from "../../components/common/Title";
import { useTheme } from "../../hooks/useTheme";
import toast, { Toaster } from "react-hot-toast";
import "../../style/icon.css";
import { alertConfirm } from "../../hooks/alertConfirm";
import { lightTheme, darkTheme } from "../../constants/grid";


ModuleRegistry.registerModules([AllCommunityModule]);

function TeacherHistoryPage() {
    const { user } = useAuth();
    const [rowData, setRowData] = useState([]);
    const theme = useTheme();

    const fetchHistory = async () => {
        if (!user) return;
        try {
            const response = await fetch(
                `http://localhost:3000/absence/history/:${user}`,
                {
                credentials: "include",
                }
            );
            if (response.ok) {
                const data = await response.json();
                setRowData(data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'historique:", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const JustificationRenderer = (params) => {
    const { validite, motif, motifValidite } = params.data;

    const Icon = ({ name, color }) => (
      <span
        className={`icon icon-${name}`}
        style={{
            width: 20,
            height: 20,
            backgroundColor: color,
        }}
      />
    );

    let icon = <Icon name="x" color="red" />;
    let statusText = "Non justifiée";
    let tooltip = "Aucune justification soumise";

    if (validite === 2) {
        icon = <Icon name="history" color="orange" />;
        statusText = "En attente";
        tooltip = `Motif étudiant : ${motif}`;
    } else if (validite === 1) {
        icon = <Icon name="check_success" color="green" />;
        statusText = "Justifiée";
        tooltip = `Motif validé : ${motifValidite || motif}`;
    } else if (validite === 0 && motif) {
        icon = <Icon name="notification" color="red" />;
        statusText = "Refusée";
        tooltip = `Justification refusée. Motif refus : ${motifValidite}`;
    }

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "help",
        }}
        title={tooltip}
      >
        {icon}
        <span>{statusText}</span>
      </div>
    );
  };

    const ActionRenderer = (params) => {
        const handleDelete = async () => {
        //  if (window.confirm(`Supprimer l'absence de ${params.data.prenom} ${params.data.nom} ?`)) {
        if (
            await alertConfirm(
            "Êtes-vous sûr ?",
            `Supprimer l'absence de ${params.data.prenom} ${params.data.nom} ?`
            )
        ) {
            try {
            const response = await fetch("http://localhost:3000/absence", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                id: params.data.numeroEtudiant,
                loginProf: user,
                debut: params.data.debut,
                fin: params.data.fin,
                }),
                credentials: "include",
            });
            if (response.ok) {
                toast.success("Absence supprimée avec succès");
                fetchHistory();
            } else {
                toast.error("Erreur lors de la suppression");
            }
            } catch (err) {
            console.error(err);
            toast.error("Erreur réseau");
            }
        }
        };

        return (
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                <button
                    onClick={handleDelete}
                    style={{ border: "none", background: "none", cursor: "pointer" }}
                >
                    <span
                        className="icon icon-trash"
                        style={{width: 18,height: 18,backgroundColor: "red",}}
                    />
                </button>
            </div>
        );
    };

    const columnDefs = useMemo(
        () => [
        {
            headerName: "Date",
            field: "debut",
            valueFormatter: (params) => {
                if (!params.value) return "";
                const valueStr = String(params.value);

                if (valueStr.includes("-") && valueStr.includes(":")) {
                    const date = new Date(valueStr);
                    if (!isNaN(date.getTime())) {
                        return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
                    }
                }

                if (valueStr.length < 8) return valueStr;

                const year = parseInt(valueStr.substring(0, 4), 10);
                const month = parseInt(valueStr.substring(4, 6), 10) - 1;
                const day = parseInt(valueStr.substring(6, 8), 10);

                const hour =
                    valueStr.length >= 10 ? parseInt(valueStr.substring(8, 10), 10) : 0;
                const min =
                    valueStr.length >= 12
                        ? parseInt(valueStr.substring(10, 12), 10)
                        : 0;

                const date = new Date(year, month, day, hour, min);

                if (isNaN(date.getTime())) {
                    return valueStr;
                }

                return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
            },
            minWidth: 160,
            filter: true,
            sortable: true,
        },
        { field: "nomMatiere", headerName: "Matière", filter: true, width: 250 },
        { field: "nom", headerName: "Nom", filter: true },
        { field: "prenom", headerName: "Prénom", filter: true },
        { field: "motif", headerName: "Motif", filter: true, flex: 1 },
        {
            headerName: "Justification",
            cellRenderer: JustificationRenderer,
            minWidth: 200,
            sortable: true,
            comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
            const getStatusRank = (data) => {
                const { validite, motif } = data;
                if (validite === 2) return 2;
                if (validite === 1) return 3;
                if (validite === 0 && motif) return 1;
                return 0;
            };
            const rankA = getStatusRank(nodeA.data);
            const rankB = getStatusRank(nodeB.data);
            if (rankA === rankB) return 0;
            return rankA > rankB ? 1 : -1;
            },
        },
        {
            headerName: "Actions",
            cellRenderer: ActionRenderer,
            width: 100,
            cellStyle: { display: "flex", justifyContent: "center" },
        },
        ],
        [user]
        );

    const defaultColDef = useMemo(
        () => ({
            resizable: true,
            sortable: true,
        }),
        []
    );

    return (
        <div
            style={{
            padding: "1rem",
            height: "97.5%",
            display: "flex",
            flexDirection: "column",
            }}
        >
            <Toaster position="top-right" reverseOrder={false} />
            <Title>Historique des Appels</Title>
            <div style={{ flex: 1, width: "100%", marginTop: "1rem" }}>
                <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                theme={theme === "dark" ? darkTheme : lightTheme}
                pagination={true}
                paginationPageSize={100}
                />
            </div>
        </div>
    )
}

export default TeacherHistoryPage;
