import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import Title from "../../components/common/Title";
import DisplayCard from "../../components/common/DisplayCard";
import CardContainer from "../../components/common/CardContainer";
import JustificationList from "../../components/JustificationList/JustificationList";
import ValidationView from "../../components/ValidationJustification/ValidationView";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";

function AdminHomePage() {
    const [selectedItem, setSelectedItem] = useState(null);
    const containerRef = useRef(null);
    const [leftWidth, setLeftWidth] = useState(50);
    const [isResizing, setIsResizing] = useState(false);

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
        [isResizing]
    );

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
            <CardContainer>
                <DisplayCard title="Nombre d'etudiants" value="10" iconLink={"./src/assets/dashboard.svg"} />
                <DisplayCard title="Nombre d'absences" value="150" iconLink={"./src/assets/dashboard.svg"} />
                <DisplayCard title="Nombre d'absences" value="150" iconLink={"./src/assets/dashboard.svg"} />
                <DisplayCard title="Nombre d'absences" value="150" iconLink={"./src/assets/dashboard.svg"} />
                <DisplayCard title="Nombre d'absences" value="150" iconLink={"./src/assets/dashboard.svg"} />
                <DisplayCard title="Nombre d'absences" value="150" iconLink={"./src/assets/dashboard.svg"} />
                <DisplayCard title="Nombre d'absences" value="150" iconLink={"./src/assets/dashboard.svg"} />
                <DisplayCard title="Nombre d'absences" value="150" iconLink={"./src/assets/dashboard.svg"} />
                <DisplayCard title="Nombre d'absences" value="150" iconLink={"./src/assets/dashboard.svg"} />
                <DisplayCard title="Nombre d'absences" value="150" iconLink={"./src/assets/dashboard.svg"} />
                <DisplayCard title="Exemple" value="10" iconLink="" />
            </CardContainer>

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
