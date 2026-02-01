import React, { useState } from "react";
import dateFormatter from "../../functions/dateFormatter";
import { useUnsaved } from "../../context/UnsavedContext";
import { useSafeNavigate } from "../../hooks/useSafeNavigate";

function ListAbsence({ creneaux, absencesBySlot }) {
    // État pour savoir quels créneaux sont ouverts (tableau d'index)
    const [openIndices, setOpenIndices] = useState([]);

    const { hasUnsavedChanges } = useUnsaved();
    const safeNavigate = useSafeNavigate(hasUnsavedChanges);

    const toggleAccordion = (index) => {
        setOpenIndices((prev) => {
            if (prev.includes(index)) {
                return prev.filter((i) => i !== index); // Fermer
            } else {
                return [...prev, index]; // Ouvrir
            }
        });
    };

    if (!creneaux || creneaux.length === 0) {
        return (
            <div className="no-absence-container">
                <span>Aucune absence déclarée</span>
            </div>
        );
    }

    return (
        <div className="creneaux-container">
            {creneaux.map((creneau, index) => {
                const absences = absencesBySlot ? absencesBySlot[index] : [];
                const isOpen = openIndices.includes(index);
                const hasAbsences = absences && absences.length > 0;
                let notComplete = false;
                if (absences) {
                    notComplete = absences.some((abs) => abs.debut < creneau.debut);
                    console.log(absences);
                }

                return (
                    <div className="creneau-wrapper" key={index}>
                        <div
                            className={`date-item clickable ${isOpen ? "active" : ""} ${notComplete ? "warning" : ""}`}
                            onClick={() => toggleAccordion(index)}
                            title="Cliquez pour voir les absences associées"
                        >
                            <div className="date-id">
                                {notComplete && (
                                    <span className="badge-warning">
                                        <span className="icon icon-warning"></span>
                                    </span>
                                )}
                                <span className="id-absence">Créneau {index + 1}</span>
                                {hasAbsences && <span className="badge-count">{absences.length}</span>}
                            </div>
                            <div className="date-content">
                                <span className="value">
                                    <span className="label">Début : </span>
                                    {dateFormatter(creneau.debut ?? 0)}
                                </span>
                                <span className="value">
                                    <span className="label">Fin : </span>
                                    {dateFormatter(creneau.fin ?? 0)}
                                </span>
                                <span className={`chevron-small ${isOpen ? "open" : ""}`} />
                            </div>
                        </div>

                        {/* Liste déroulante des absences */}
                        {isOpen && (
                            <>
                                {notComplete && (
                                    <div className="not-complete-container">
                                        <span>Absence partiellement justifiée</span>
                                    </div>
                                )}

                                <div className="absences-dropdown fade-in">
                                    {hasAbsences ? (
                                        absences.map((abs, i) => (
                                            <div key={i} className="sub-absence-item">
                                                <div className="sub-info">
                                                    <span className="dot-status"></span>
                                                    <span>
                                                        <strong>Absence {abs.libelle}:</strong>{" "}
                                                        <span className={abs.debut < creneau.debut ? "abs-warning" : ""}> {dateFormatter(abs.debut)}</span> -{" "}
                                                        <span className={abs.fin > creneau.fin ? "abs-warning" : ""}>{dateFormatter(abs.fin)}</span>
                                                    </span>
                                                </div>
                                                <button className="absence-detail-button">
                                                    <span
                                                        className="icon icon-triple-dot"
                                                        onClick={() => safeNavigate("/admin/detail-absence/" + abs.idAbsence)}
                                                    />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-sub-absence">Aucune absence déclarée par un enseignant sur cette période.</div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default ListAbsence;
