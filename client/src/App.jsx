import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
// import AdminIndex from "./components/AdminIndex";
// import Justifier from "./components/Justifier";
import Layout from "./components/Layout";
// import EleveIndex from "./components/EleveIndex";
// import ValidationForm from "./components/ValidationForm";
import RequireAuth from "./components/RequireAuth";
// import Unauthorized from "./components/Unauthorized";
// import NoResponse from "./components/NoResponse";
// import JustificationInfo from "./components/JustificationInfo";
import AddStudentPage from "./pages/AddStudentPage";
// import VoirJustification from "./components/VoirJustification";
// import StudentsList from "./components/StudentsList";
// import UpdateStudent from "./components/UpdateStudent";
// import TeacherIndex from "./components/TeacherIndex";
// import TeacherAppel from "./components/TeacherList";
// import TeacherModif from "./components/AppelModif";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/*public routes*/}
        <Route path="" element={<LoginPage />} />
        <Route path="login" element={<LoginPage />} />
        {/* <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="noResponse" element={<NoResponse />} /> */}

        {/*limited routes*/}
        <Route element={<RequireAuth allowedRole={"admin"} />}>
          {/* <Route path="admin/index" element={<AdminIndex />} />
          <Route path="admin/validationForm" element={<ValidationForm />} />
          <Route path="admin/validation/:id" element={<ValidationForm />} />
          <Route
            path="admin/justificationInfo"
            element={<JustificationInfo />}
          /> */}
          <Route path="admin/addStudents" element={<AddStudentPage />} />
          {/* <Route path="admin/studentsList" element={<StudentsList />} />
          <Route path="admin/updateStudent" element={<UpdateStudent />} /> */}
        </Route>

        <Route element={<RequireAuth allowedRole={"teacher"} />}>
          {/* <Route path="teacher/studentsList" element={<StudentsList />} />
          <Route path="teacher/index" element={<TeacherIndex />} />
          <Route path="teacher/appelList" element={<TeacherAppel />} />
          <Route path="teacher/appelModif" element={<TeacherModif />} /> */}
        </Route>

        <Route element={<RequireAuth allowedRole={"student"} />}>
          {/* <Route path="eleve/justifier" element={<Justifier />} />
          <Route path="eleve/index" element={<EleveIndex />} />
          <Route path="eleve/justification" element={<VoirJustification />} /> */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
