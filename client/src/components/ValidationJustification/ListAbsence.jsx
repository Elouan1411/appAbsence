import React from "react";
import dateFormatter from "../../functions/dateFormatter";
function ListAbsence({ creneaux }) {
    return (
        <div className="creneaux-container">
            {creneaux?.map((creneau, index) => (
                <div className="date-item" key={index}>
                    <div className="date-id">
                        <span className="id-absence">Absence n° {index + 1}</span>
                    </div>
                    <div className="date-content">
                        <span className="value">
                            <span className="label">Date de début : </span>
                            {dateFormatter(creneau.debut ?? 0)}
                        </span>
                        <span className="value">
                            <span className="label">Date de fin : </span>
                            {dateFormatter(creneau.fin ?? 0)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ListAbsence;
