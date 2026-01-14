import React, { useState } from "react";
import AddingTabs from "../../components/Adding/AddingTabs";
import PageTitle from "../../components/common/PageTitle";
import "../../style/Admin.css";
import FormModal from "../../components/Adding/FormModal";
import toast from "react-hot-toast";
import DataImport from "../../components/Adding/DataImport";

function AddingPage() {
    const [activeTab, setActiveTab] = useState("student");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        console.log("Données reçues du formulaire :", data);

        const baseUrl = "http://localhost:3000";
        const endpoint = activeTab === "student" ? "/eleve" : "/teacher";
        const url = `${baseUrl}${endpoint}/add`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const createdUser = await response.json();
            console.log("Utilisateur créé avec succès :", createdUser);

            toast.success(`${activeTab == "student" ? "Étudiant" : "Enseignant"} ajouté avec succès !`);
        } catch (error) {
            console.error("Erreur lors de la création :", error);
            toast.error("Une erreur est survenue");
        }
    };
    return (
        <div className="adding-container">
            <PageTitle icon="icon-adding-group" title="Ajouter des étudiants / professeurs" />
            <AddingTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="adding-content">
                <DataImport type={activeTab} openModal={openModal} />
            </div>

            <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode={activeTab} onSubmit={handleSubmit} />
        </div>
    );
}

export default AddingPage;
