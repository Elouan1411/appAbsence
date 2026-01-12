import React from "react";
import PageTitle from "../../components/common/PageTitle";
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
            <PageTitle title="Page d'accueil enseignant" icon="icon-home" />
            <Button onClick={handleSignOut}>Se déconnecter</Button>
        </div>
    );
}

export default TeacherHomePage;
