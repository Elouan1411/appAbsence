import React from "react";
import { useAuth } from "../../hooks/useAuth";
import Title from "../../components/common/Title";
import Button from "../../components/common/Button";
function AdminHomePage() {
  const { logout } = useAuth();
  const handleSignOut = async () => {
    console.log("ok");
    await logout();
    try {
    } catch (error) {}
  };
  return (
    <div>
      <Title>Page d'accueil admin</Title>
      <Button onClick={handleSignOut}>Se déconnecter</Button>
    </div>
  );
}

export default AdminHomePage;
