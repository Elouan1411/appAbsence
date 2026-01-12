import AdminHomePage from "./pages/Admin/AdminHomePage";
import ImportStudentsPage from "./pages/Admin/ImportStudentsPage";
import TeacherHomePage from "./pages/Teacher/TeacherHomePage";
import StudentHomePage from "./pages/Student/StudentHomePage";
import StudentJustificationPage from "./pages/Student/StudentJustificationPage";
import ShowStudentPage from "./pages/Admin/ShowStudentPage";
import RollCallPage from "./pages/Teacher/RollCallPage";
import TeacherHistoryPage from "./pages/Teacher/TeacherHistoryPage";
import TeacherAbsencePage from "./pages/Teacher/TeacherAbsencePage";
import React from "react";
import AddTeacherPage from "./pages/Admin/AddTeacherPage";
//bfuiegz
export const routesConfig = [
    {
        path: "/admin",
        allowedRoles: ["admin"],

        children: [
            { index: true, label: "Tableau de bord", element: <AdminHomePage />, icon: "icon-board-table" },
            { path: "import", label: "Importer Élèves", element: <ImportStudentsPage />, icon: "icon-import-student" },
            { path: "studentlist", label: "Liste des Élèves", element: <ShowStudentPage />, icon: "icon-student-list" },
            { path: "teacherlist", label: "Liste des Professeurs", element: <AddTeacherPage />, icon: "icon-student-list" },
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
        ],
    },
];
