import React from "react";
import Title from "../../components/common/Title";
import StudentList from "../../components/StudentList/StudentList";
function ShowStudentPage() {
  return (
    <div className="showStudentPage">
      <div className="title-container">
        <span className="icon-big icon-liste-des-eleves"></span>
        <Title>Liste des étudiants</Title>
      </div>
      <div className="studentListContainer">
        <StudentList />
      </div>
    </div>
  );
}

export default ShowStudentPage;
