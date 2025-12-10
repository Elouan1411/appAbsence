import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layouts/Layout";
import TeacherHomePage from "./pages/Teacher/TeacherHomePage";
import AdminHomePage from "./pages/Admin/AdminHomePage";
import StudentHomePage from "./pages/Student/StudentHomePage";
import ErrorPage from "./pages/ErrorPage";
import ImportStudentsPage from "./pages/Admin/ImportStudentsPage";
function App() {
  const { user, role } = useAuth();
  return (
    <Routes>
      {!user && <Route path="/" element={<LoginPage />} />}

      {user && role === "admin" && (
        <Route path="/admin" element={<Layout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="import" element={<ImportStudentsPage />} />
        </Route>
      )}

      {user && role === "teacher" && (
        <Route path="/teacher" element={<Layout />}>
          <Route index element={<TeacherHomePage />} />
        </Route>
      )}

      {user && role === "student" && (
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<StudentHomePage />} />
        </Route>
      )}

      <Route path="/error" element={<ErrorPage />} />

      <Route path="*" element={!user ? <Navigate to="/" replace /> : <></>} />
    </Routes>
  );
}

export default App;
