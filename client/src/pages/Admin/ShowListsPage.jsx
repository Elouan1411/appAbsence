import React, { useState } from "react";
import Title from "../../components/common/Title";
import StudentList from "../../components/Lists/StudentList/StudentList";
import PageTitle from "../../components/common/PageTitle";
import AddingTabs from "../../components/Adding/AddingTabs";
import TeacherList from "../../components/Lists/TeacherList/TeacherList";
function ShowListsPage() {
    const [activeTab, setActiveTab] = useState("student");
    return (
        <div className="showStudentPage">
            <PageTitle title={`Liste des ${activeTab == "student" ? "étudiants" : "enseignants"}`} icon={"icon-student-list"} />
            <AddingTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab == "student" ? (
                <div className="studentListContainer">
                    <StudentList />
                </div>
            ) : (
                <div className="teacherListContainer">
                    <TeacherList />
                </div>
            )}
        </div>
    );
}

export default ShowListsPage;
