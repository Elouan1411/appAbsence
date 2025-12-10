import React from "react";
import { useAuth } from "../../hooks/useAuth";
import Title from "../../components/common/Title";
import Button from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
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

  const handleNavigate = () => {
    navigate("/admin/import", { replace: true });
  };
  return (
    <div>
      <Title>Page d'accueil admin</Title>
      <Button onClick={handleSignOut}>Se déconnecter</Button>
      <Button onClick={handleNavigate}>Naviguer vers la page d'import</Button>
    </div>
  );
}

export default AdminHomePage;
