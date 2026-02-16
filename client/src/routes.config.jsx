import AdminHomePage from "./pages/Admin/AdminHomePage";
import TeacherHomePage from "./pages/Teacher/TeacherHomePage";
import StudentHomePage from "./pages/Student/StudentHomePage";
import StudentJustificationPage from "./pages/Student/StudentJustificationPage";
import StudentAbsenceDetailsPage from "./pages/Student/StudentAbsenceDetailsPage";
import ShowListsPage from "./pages/Admin/ShowListsPage";
import RollCallPage from "./pages/Teacher/RollCallPage";
import TeacherHistoryPage from "./pages/Teacher/TeacherHistoryPage";
import TeacherAbsencePage from "./pages/Teacher/TeacherAbsencePage";
import AddingPage from "./pages/Admin/AddingPage";
import StudentDetailPage from "./pages/Admin/StudentDetailPage";
import React from "react";
import AbsenceDetailPage from "./pages/Admin/AbsenceDetailPage";
import SettingsPage from "./pages/Admin/SettingsPage";
import AdminJustificationPage from "./pages/Admin/AdminJustificationPage";
import SettingMobilePage from "./pages/SettingsMobilePage";
import InitPage from "./pages/InitPage";
import TeacherDetailPage from "./pages/Teacher/TeacherDetailPage";

export const routesConfig = [
    {
        path: "/admin",
        allowedRoles: ["admin"],

        children: [
            { index: true, label: "Tableau de bord", element: <AdminHomePage />, icon: "icon-board-table" },
            { path: "justification", label: "Justifier", element: <AdminJustificationPage />, icon: "icon-justification-student" },
            { path: "ajout", label: "Ajouter des membres", element: <AddingPage />, icon: "icon-adding-group" },
            { path: "listes", label: "Listes", element: <ShowListsPage />, icon: "icon-student-list" },
            { path: "appel", label: "Appel", element: <RollCallPage />, icon: "icon-rollcall" },
            { path: "parametres", element: <SettingsPage /> },
            { path: "detail-etudiant/:userId", label: "Détail étudiant", element: <StudentDetailPage /> },
            { path: "detail-enseignant/:loginENT", element: <TeacherDetailPage /> },
            { path: "detail-absence/:absenceId", label: "Détail absence", element: <AbsenceDetailPage /> },
            { path: "historique", label: "Historique", element: <TeacherHistoryPage />, icon: "icon-history" },
        ],
    },
    {
        path: "/enseignant",
        allowedRoles: ["teacher"],
        children: [
            { index: true, label: "Accueil", element: <TeacherHomePage />, icon: "icon-home" },
            { path: "appel", label: "Appel", element: <RollCallPage />, icon: "icon-rollcall" },
            { path: "historique", label: "Historique", element: <TeacherHistoryPage />, icon: "icon-history" },
            { path: "absence", label: "Absences", element: <TeacherAbsencePage /> },
            { path: "parametres", label: "Menu", element: <SettingMobilePage />, icon: "icon-settings" },
        ],
    },
    {
        path: "/etudiant",
        allowedRoles: ["student"],
        children: [
            { index: true, label: "Mon Espace", element: <StudentHomePage />, icon: "icon-home" },
            { path: "justification", label: "Justifier une absence", element: <StudentJustificationPage />, icon: "icon-justification-student" },
            { path: "absence/:id", element: <StudentAbsenceDetailsPage />, icon: "icon-absences" },
            { path: "parametres", label: "Menu", element: <SettingMobilePage />, icon: "icon-settings" },
        ],
    },
    {
        path: "/init",
        allowedRoles: ["init"],
        children: [{ index: true, label: "Configuration", element: <InitPage />, icon: "icon-settings-2" }],
    },
];
