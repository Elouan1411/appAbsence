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
import AbsencePage from "./pages/Admin/AbsencePage";

export const routesConfig = [
    {
        path: "/admin",
        allowedRoles: ["admin"],

        children: [
            { index: true, label: "Tableau de bord", element: <AdminHomePage />, icon: "icon-board-table" },
            { path: "add", label: "Ajouter des membres", element: <AddingPage />, icon: "icon-adding-group" },
            { path: "lists", label: "Listes", element: <ShowListsPage />, icon: "icon-student-list" },
            { path: "rollcall", label: "Appel", element: <RollCallPage />, icon: "icon-rollcall" },
            { path: "settings", element: <SettingsPage /> },
            { path: "studentdetail/:userId", label: "Détail étudiant", element: <StudentDetailPage /> },
            { path: "absencedetail/:absenceId", label: "Détail absence", element: <AbsenceDetailPage /> },
            { path: "history", label: "Historique", element: <TeacherHistoryPage />, icon: "icon-history" },
            { path: "absences", label: "Absences non justifiées", element: <AbsencePage />, icon: "icon-justification-student" },
        ],
    },
    {
        path: "/teacher",
        allowedRoles: ["teacher"],
        children: [
            { index: true, label: "Accueil", element: <TeacherHomePage />, icon: "icon-home" },
            { path: "rollcall", label: "Appel", element: <RollCallPage />, icon: "icon-rollcall" },
            { path: "history", label: "Historique", element: <TeacherHistoryPage />, icon: "icon-history" },
            { path: "absence", label: "Absences", element: <TeacherAbsencePage /> },
        ],
    },
    {
        path: "/dashboard",
        allowedRoles: ["student"],
        children: [
            { index: true, label: "Mon Espace", element: <StudentHomePage />, icon: "icon-home" },
            { path: "justification", label: "Justifier une absence", element: <StudentJustificationPage />, icon: "icon-justification-student" },
            { path: "absence/:id", label: "Détail Absence", element: <StudentAbsenceDetailsPage />, icon: "icon-justification-student" },
        ],
    },
];
