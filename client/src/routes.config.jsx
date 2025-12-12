import AdminHomePage from "./pages/Admin/AdminHomePage";
import ImportStudentsPage from "./pages/Admin/ImportStudentsPage";
import TeacherHomePage from "./pages/Teacher/TeacherHomePage";
import StudentHomePage from "./pages/Student/StudentHomePage";

export const routesConfig = [
  {
    path: "/admin",
    allowedRoles: ["admin"],

    children: [
      { index: true, label: "Tableau de bord", element: <AdminHomePage /> },
      { path: "import", label: "Importer Élèves", element: <ImportStudentsPage /> },
      { path: "studentlist", label: "Liste des Élèves", element: <ShowStudentPage /> }
    ]
  },
  {
    path: "/teacher",
    allowedRoles: ["teacher"],
    children: [
      { index: true, label: "Tableau de bord", element: <TeacherHomePage /> }
    ]
  },
  {
    path: "/dashboard",
    allowedRoles: ["student"],
    children: [
      { index: true, label: "Mon Espace", element: <StudentHomePage /> }
    ]
  }
];