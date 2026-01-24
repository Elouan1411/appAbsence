import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AbsenceCard from "./AbsenceCard";
import dateFormatter from "../../functions/dateFormatter";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AbsencePdfDocument from "./AbsencePdfDocument";
import Pagination from "../common/Pagination";
import { API_URL } from "../../config";

const STEP = 4;

function AbsenceList({ setLoading, userId, setAbsences, absences, student }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [toUpdate, setToUpdate] = useState(false);
    const [absencesToShow, setAbsenceToShow] = useState([]);

    useEffect(() => {
        const start = (currentPage - 1) * STEP;
        const end = currentPage * STEP;
        if (Array.isArray(absences)) {
            setAbsenceToShow(absences.slice(start, end));
        }
    }, [currentPage, absences]);

    const numberOfAbsences = absences.length;
    const totalPages = Math.ceil(numberOfAbsences / STEP);

    const handleFetchAbsences = async () => {
        try {
            setLoading(true);
            const result = await fetch(`${API_URL}/absence/` + userId, {
                method: "GET",
                credentials: "include",
            });
            const data = await result.json();
            setAbsences(data);
        } catch (err) {
            toast.error("Erreur : " + err.message);
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

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="absence-list-container">
            <div className="subtitle-container">
                <div className="subtitle">
                    <h2>Liste d'absences</h2>
                    {numberOfAbsences > 0 && <span className="absence-count">{numberOfAbsences}</span>}
                </div>

                {numberOfAbsences > 0 && student && (
                    <PDFDownloadLink
                        document={<AbsencePdfDocument student={student} absences={absences} />}
                        fileName={`Absences_${student.nom}_${student.prenom}_${new Date().getFullYear()}.pdf`}
                        style={{ textDecoration: "none" }}
                    >
                        {({ loading }) => (
                            <button className="icon-button" title="Exporter en PDF" disabled={loading}>
                                <span className="icon icon-export"></span>
                            </button>
                        )}
                    </PDFDownloadLink>
                )}
            </div>
            <div className="absence-list-subcontainer">
                {absencesToShow.length > 0 ? (
                    <>
                        {absencesToShow.map((absence, index) => (
                            <AbsenceCard
                                key={absence.idAbsence || index}
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
                        ))}
                        <Pagination onPageChange={handlePageChange} totalPages={totalPages} currentPage={currentPage} />
                    </>
                ) : (
                    <p>Aucune absence</p>
                )}
            </div>
        </div>
    );
}

export default AbsenceList;
