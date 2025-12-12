import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layouts/Layout";
import TeacherHomePage from "./pages/Teacher/TeacherHomePage";
import AdminHomePage from "./pages/Admin/AdminHomePage";
import StudentHomePage from "./pages/Student/StudentHomePage";
import ErrorPage from "./pages/ErrorPage";
import ImportStudentsPage from "./pages/Admin/ImportStudentsPage";
import ShowStudentPage from "./pages/Admin/ShowStudentPage";

function App() {
  const { user, role, loading } = useAuth();

  console.log("user : ", user, "/ role: ", role);
  if (loading) {
    return <div>En chargement</div>;
  }
  return (
    <Routes>
      {!user ? <Route path="/" element={<LoginPage />} /> : <></>}
      {user && (
        <Route
          path="/"
          element={
            <Navigate
              to={
                role === "admin"
                  ? "/admin"
                  : role === "teacher"
                  ? "/teacher"
                  : "/dashboard"
              }
              replace
            />
          }
        />
      )}
      <Route
        path="/admin"
        element={
          user && role === "admin" ? <Layout /> : <Navigate to="/error" />
        }
      >
        <Route index element={<AdminHomePage />} />
        <Route path="import" element={<ImportStudentsPage />} />
        <Route path="studentlist" element={<ShowStudentPage />} />
      </Route>

      <Route
        path="/teacher"
        element={
          user && role === "teacher" ? <Layout /> : <Navigate to="/error" />
        }
      >
        <Route index element={<TeacherHomePage />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          user && role === "student" ? <Layout /> : <Navigate to="/error" />
        }
      >
        <Route index element={<StudentHomePage />} />
      </Route>

      <Route path="/error" element={<ErrorPage />} />

      <Route path="*" element={<Navigate to={user ? "/" : "/"} replace />} />
    </Routes>
  );
}

export default App;
