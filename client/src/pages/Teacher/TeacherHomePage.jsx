import React from "react";
import Title from "../../components/common/Title";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

function TeacherHomePage() {
  const { logout } = useAuth();
  const handleSignOut = async () => {
    console.log("ok");
    await logout();
    try {
    } catch (error) {}
  };
  return (
    <div>
      <Title>Page d'accueil enseignant</Title>
      <Button onClick={handleSignOut}>Se déconnecter</Button>
    </div>
  );
}

export default TeacherHomePage;
