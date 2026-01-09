import AdminHomePage from "./pages/Admin/AdminHomePage";
import ImportStudentsPage from "./pages/Admin/ImportStudentsPage";
import TeacherHomePage from "./pages/Teacher/TeacherHomePage";
import StudentHomePage from "./pages/Student/StudentHomePage";
import StudentJustificationPage from "./pages/Student/StudentJustificationPage";
import ShowStudentPage from "./pages/Admin/ShowStudentPage";
import RollCallPage from "./pages/Teacher/RollCallPage";
import TeacherHistoryPage from "./pages/Teacher/TeacherHistoryPage";
//bfuiegz
export const routesConfig = [
    {
        path: "/admin",
        allowedRoles: ["admin"],

        children: [
            { index: true, label: "Tableau de bord", element: <AdminHomePage /> },
            { path: "import", label: "Importer Élèves", element: <ImportStudentsPage /> },
            { path: "studentlist", label: "Liste des Élèves", element: <ShowStudentPage /> },
        ],
    },
    {
        path: "/teacher",
        allowedRoles: ["teacher"],
        children: [
            { index: true, label: "Tableau de bord", element: <TeacherHomePage /> },
            { path: "rollcall", label: "Appel", element: <RollCallPage /> },
            { path: "history", label: "Historique", element: <TeacherHistoryPage /> },
        ],
    },
    {
        path: "/dashboard",
        allowedRoles: ["student"],
        children: [
            { index: true, label: "Mon Espace", element: <StudentHomePage /> },
            { path: "justification", label: "Justifier une absence", element: <StudentJustificationPage />, icon: "icon-justification-student" },
        ],
    },
];
