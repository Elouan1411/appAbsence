import React, { useState, useEffect } from "react";
import "../../style/SelectGroups.css";

function SelectTeacher({ onChange, style, value }) {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(value || "");

    useEffect(() => {
        async function fetchTeachers() {
            try {
                const response = await fetch("http://localhost:3000/teacher/all", {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    data.sort((a, b) => a.nom.localeCompare(b.nom));
                    setTeachers(data);
                }
            } catch (err) {
                console.error("Erreur lors de la récupération des enseignants:", err);
            }
        }
        fetchTeachers();
    }, []);

    useEffect(() => {
        setSelectedTeacher(value || "");
    }, [value]);

    const handleTeacherChange = (event) => {
        const newTeacher = event.target.value;
        setSelectedTeacher(newTeacher);
        if (onChange) {
            onChange(newTeacher);
        }
    };

    return (
        <div className="Card cols-1" style={{ height: "fit-content", ...style }}>
            <h2>Selectionner un enseignant</h2>
            
            <div className="input-group">
                <label htmlFor="Teacher">Enseignant</label>
                <select onChange={handleTeacherChange} value={selectedTeacher}>
                    <option value="">-- Choisir --</option>
                    {teachers.map((teacher) => (
                        <option key={teacher.loginENT} value={teacher.loginENT}>
                            {teacher.nom.toUpperCase()} {teacher.prenom}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default SelectTeacher;
