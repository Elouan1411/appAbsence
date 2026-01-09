import React from "react";
import Title from "../../components/common/Title";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import PageTitle from "../../components/common/PageTitle";

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
            <PageTitle title="Accueil" icon="icon-home" />
            <Button onClick={handleSignOut}>Se déconnecter</Button>
        </div>
    );
}

export default TeacherHomePage;
