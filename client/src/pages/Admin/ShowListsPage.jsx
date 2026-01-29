import React, { useState } from "react";
import Title from "../../components/common/Title";
import StudentList from "../../components/Lists/StudentList/StudentList";
import PageTitle from "../../components/common/PageTitle";
import ListTabs from "../../components/Adding/ListTabs";
import TeacherList from "../../components/Lists/TeacherList/TeacherList";
import AbsenceList from "../../components/AbsencePage/AbsenceList";
function ShowListsPage() {
    const [activeTab, setActiveTab] = useState("student");
    return (
        <div className="showStudentPage">
            <PageTitle title={`Liste des ${activeTab == "student" ? "étudiants" : activeTab == "teacher" ? "enseignants" : "absences"}`} icon={"icon-student-list"} />
            <ListTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab == "student" ? (
                <div className="studentListContainer">
                    <StudentList />
                </div>
            ) :  activeTab == "teacher" ?(
                <div className="teacherListContainer">
                    <TeacherList />
                </div>
            ) : <div className="teacherListContainer">
                <AbsenceList />
            </div>}
        </div>
    );
}

export default ShowListsPage;
