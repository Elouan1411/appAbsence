import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import Title from "../../components/common/Title";
import DisplayCard from "../../components/common/DisplayCard";
import CardContainer from "../../components/common/CardContainer";
import JustificationList from "../../components/JustificationList/JustificationList";
import ValidationView from "../../components/ValidationJustification/ValidationView";
import { useNavigate } from "react-router-dom";

function AdminHomePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const containerRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

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

        const newLeftWidth =
          ((mouseMoveEvent.clientX - containerRect.left) /
            containerRect.width) *
          100;

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

  const handleSignOut = async () => {
    console.log("ok");

    await logout();

    navigate("/", { replace: true });

    try {
    } catch (error) {}
  };

  const handleNavigateImport = () => {
    navigate("/admin/import", { replace: true });
  };

  const handleNavigateList = () => {
    navigate("/admin/studentlist", { replace: true });
  };

  return (
    <div className={isResizing ? "resizing-cursor" : ""}>
      <div className="title-container">
        <span className="icon-big icon-tableau-de-bord"></span>
        <Title>Tableau de bord</Title>
      </div>

      <CardContainer>
        <DisplayCard
          title="Nombre d'etudiants"
          value="10"
          iconLink={"./src/assets/dashboard.svg"}
        />
        <DisplayCard
          title="Nombre d'absences"
          value="150"
          iconLink={"./src/assets/dashboard.svg"}
        />
        <DisplayCard
          title="Nombre d'absences"
          value="150"
          iconLink={"./src/assets/dashboard.svg"}
        />
        <DisplayCard
          title="Nombre d'absences"
          value="150"
          iconLink={"./src/assets/dashboard.svg"}
        />
        <DisplayCard
          title="Nombre d'absences"
          value="150"
          iconLink={"./src/assets/dashboard.svg"}
        />
        <DisplayCard
          title="Nombre d'absences"
          value="150"
          iconLink={"./src/assets/dashboard.svg"}
        />
        <DisplayCard
          title="Nombre d'absences"
          value="150"
          iconLink={"./src/assets/dashboard.svg"}
        />
        <DisplayCard
          title="Nombre d'absences"
          value="150"
          iconLink={"./src/assets/dashboard.svg"}
        />
        <DisplayCard
          title="Nombre d'absences"
          value="150"
          iconLink={"./src/assets/dashboard.svg"}
        />
        <DisplayCard
          title="Nombre d'absences"
          value="150"
          iconLink={"./src/assets/dashboard.svg"}
        />
        <DisplayCard title="Exemple" value="10" iconLink="" />
      </CardContainer>

      <div className="justification-container" ref={containerRef}>
        <div className="left part" style={{ width: `${leftWidth}%` }}>
          <JustificationList
            setSelectedId={setSelectedId}
            selectedId={selectedId}
          />
        </div>

        <div className="resizing-bar" onMouseDown={startResizing}>
          <div className="resizer" />
        </div>

        <div className="part right" style={{ width: `${100 - leftWidth}%` }}>
          {selectedId ? (
            <ValidationView idAbsence={selectedId} />
          ) : (
            <div className="empty-state">Sélectionnez un étudiant</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminHomePage;
