import React from "react";
import { useState } from "react";
import ImportZone from "../../components/ImportStudentsPage/ImportZone";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/common/Button";
import Separator from "../../components/AddTeacher/Separator";

function AddTeacherPage() {
    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([]);
    return (
        <div className="add-teacher-container">
            <PageTitle title={"Importer des professeurs"} icon={"icon-import-student"} />
            <div className="add-teacher-content">
                {rowData.length > 0 ? (
                    <></>
                ) : (
                    <div className="content-import">
                        <ImportZone setRowData={setRowData} setColDefs={setColDefs} />
                        <Separator>ou alors ajoutez un professeur</Separator>
                        <Button className="add-button">Ajouter</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddTeacherPage;
