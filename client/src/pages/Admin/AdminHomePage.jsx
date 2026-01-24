import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import Title from "../../components/common/Title";
import DisplayCard from "../../components/common/DisplayCard";
import CardContainer from "../../components/common/CardContainer";
import JustificationList from "../../components/JustificationList/JustificationList";
import ValidationView from "../../components/ValidationJustification/ValidationView";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import toast from "react-hot-toast";
import { API_URL } from "../../config";

function AdminHomePage() {
    const [selectedItem, setSelectedItem] = useState(null);
    const containerRef = useRef(null);
    const [leftWidth, setLeftWidth] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const [numberOfStudents, setNumberOfStudents] = useState(0);
    const [numberOfJustification, setNumberOfJustification] = useState(0);

    const [reloadJustifications, setReloadJustifications] = useState(0);

    const reload = () => {
        setReloadJustifications((prev) => prev + 1);
    };

    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent) => {
            if (isResizing && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();

                const newLeftWidth = ((mouseMoveEvent.clientX - containerRect.left) / containerRect.width) * 100;

                if (newLeftWidth > 20 && newLeftWidth < 80) {
                    setLeftWidth(newLeftWidth);
                }
            }
        },
        [isResizing],
    );

    const handleFetchNumberOfStudents = useCallback(async () => {
        try {
            const result = await fetch(`${API_URL}/eleve/count`, {
                method: "GET",
                credentials: "include",
            });

            if (!result.ok) throw new Error("Erreur lors de la récupération");

            const data = await result.json();

            console.log(data[0]);

            setNumberOfStudents(data[0].nombre);
        } catch (err) {
            console.error(err);
            toast.error("Erreur de chargement des étudiants");
        }
    }, []);

    const handleFetchNumberOfJustification = useCallback(async () => {
        try {
            const result = await fetch(`${API_URL}/justification/count`, {
                method: "GET",
                credentials: "include",
            });

            if (!result.ok) throw new Error("Erreur lors de la récupération");

            const data = await result.json();

            console.log(data[0]);

            setNumberOfJustification(data[0].total);
        } catch (err) {
            console.error(err);
            toast.error("Erreur de chargement des justifications");
        }
    }, []);

    useEffect(() => {
        handleFetchNumberOfStudents();
        handleFetchNumberOfJustification();
    }, [handleFetchNumberOfStudents]);

    const isFetching = useRef(false);

    useEffect(() => {
        // Auto-refresh every 5 seconds
        const interval = setInterval(async () => {
            if (isFetching.current) return;

            isFetching.current = true;
            try {
                await handleFetchNumberOfJustification();
                reload();
            } catch (error) {
                console.error("Auto-refresh error", error);
            } finally {
                isFetching.current = false;
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [handleFetchNumberOfJustification]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    return (
        <div className={isResizing ? "resizing-cursor admin-homepage-container" : "admin-homepage-container"}>
            <PageTitle title="Tableau de bord" icon={"icon-board-table"} />
            {/* <CardContainer>
                <DisplayCard title="Nombre d'étudiants" value={numberOfStudents} iconLink={"./src/assets/school.svg"} />
                <DisplayCard title="Justifications en cours" value={numberOfJustification} iconLink={"./src/assets/todo.svg"} />
            </CardContainer> */}

            <div className="homepage-subtitle-container">
                <h2 className="homepage-subtitle">Justifier des absences</h2>
            </div>
            <div className="justification-container" ref={containerRef}>
                <div className="left part" style={{ width: `${leftWidth}%` }}>
                    <JustificationList setSelectedItem={setSelectedItem} selectedItem={selectedItem} reload={reloadJustifications} />
                </div>

                <div className="resizing-bar" onMouseDown={startResizing}>
                    <div className="resizer" />
                </div>

                <div className="part right" style={{ width: `${100 - leftWidth}%` }}>
                    {selectedItem ? (
                        <ValidationView selectedItem={selectedItem} reload={reload} />
                    ) : (
                        <div className="empty-state">Sélectionnez une justification</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminHomePage;
