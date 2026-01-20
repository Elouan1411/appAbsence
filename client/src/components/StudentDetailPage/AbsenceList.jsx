import React, { useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import AbsenceCard from "./AbsenceCard";
import dateFormatter from "../../functions/dateFormatter";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AbsencePdfDocument from "./AbsencePdfDocument";

function AbsenceList({ setLoading, userId, setAbsences, absences, student }) {
    const [toUpdate, setToUpdate] = useState(false);
    const handleFetchAbsences = async () => {
        try {
            setLoading(true);
            const result = await fetch("http://localhost:3000/absence/" + userId, {
                method: "GET",
                credentials: "include",
            });

            const data = await result.json();
            console.log(data);
            setAbsences(data);
        } catch (err) {
            toast.error("Erreur : ", err);
            return;
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        handleFetchAbsences();
    }, []);

    useEffect(() => {
        if (toUpdate) {
            handleFetchAbsences();
            setToUpdate(false);
        }
    }, [toUpdate]);

    return (
        <div className="absence-list-container">
            <div className="subtitle-container">
                <h2>Liste d'absences</h2>
                {Object.values(absences).length > 0 && (
                    <div className="absence-count-container">
                        <span className="tab-count">{Object.values(absences).length}</span>
                        {student && (
                            <PDFDownloadLink
                                document={<AbsencePdfDocument student={student} absences={absences} />}
                                fileName={`Absences_${student.nom}_${student.prenom}_${new Date().getFullYear()}.pdf`}
                                style={{ textDecoration: "none" }}
                            >
                                {({ blob, url, loading, error }) => (
                                    <button className="icon-button" title="Exporter en PDF">
                                       <span className="icon icon-export"></span>
                                    </button>
                                )}
                            </PDFDownloadLink>
                        )}
                    </div>
                )}
            </div>
            <div className="absence-list-subcontainer">
                {Object.values(absences).length > 0 ? (
                    Object.values(absences).map((absence, index) => (
                        <AbsenceCard
                            key={index}
                            subject={absence.libelle}
                            startTime={dateFormatter(absence.debut)}
                            endTime={dateFormatter(absence.fin)}
                            justified={absence.justifie}
                            nom={absence.nom}
                            prenom={absence.prenom}
                            courseType={absence.groupeTP ? "TP" : absence.groupeTD ? "TD" : "CM"}
                            idAbsence={absence.idAbsence}
                            setToUpdate={setToUpdate}
                        />
                    ))
                ) : (
                    <p>Aucune absence</p>
                )}
            </div>
        </div>
    );
}

export default AbsenceList;
