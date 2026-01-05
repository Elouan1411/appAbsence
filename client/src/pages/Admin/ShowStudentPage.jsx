import React from "react";
import Title from "../../components/common/Title";
import StudentList from "../../components/StudentList/StudentList";
function ShowStudentPage() {
  return (
    <div>
      <Title>Liste des étudiants</Title>
      <StudentList />
    </div>
  );
}

export default ShowStudentPage;
