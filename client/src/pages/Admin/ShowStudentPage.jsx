import React from "react";
import Title from "../../components/common/Title";
import StudentList from "../../components/StudentList/StudentList";
import PageTitle from "../../components/common/PageTitle";
function ShowStudentPage() {
    return (
        <div className="showStudentPage">
            <PageTitle title="Liste des élèves" icon={"icon-student-list"} />
            <div className="studentListContainer">
                <StudentList />
            </div>
        </div>
    );
}

export default ShowStudentPage;
