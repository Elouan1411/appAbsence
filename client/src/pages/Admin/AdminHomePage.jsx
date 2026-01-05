import React from "react";
import { useAuth } from "../../hooks/useAuth";
import Title from "../../components/common/Title";
import Button from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
import DisplayCard from "../../components/common/DisplayCard";
import CardContainer from "../../components/common/CardContainer";
import JustificationList from "../../components/JustificationList/JustificationList";

function AdminHomePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
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
    <div>
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
      </CardContainer>

      <div className="justificationListContainer">
        <JustificationList />
      </div>
    </div>
  );
}

export default AdminHomePage;
