import React, { useState } from "react";
import "../../style/Student.css";
import toast, { Toaster } from "react-hot-toast";
import trashIcon from "../../assets/trash.svg";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowRight } from "lucide-react";

registerLocale("fr", fr);

const PeriodAbsence = () => {
    // Initial state with Date objects
    const [period, setPeriod] = useState([]);

    const addPeriod = () => {
        const start = new Date();
        start.setHours(8, 0, 0, 0);

        const end = new Date();
        end.setHours(17, 0, 0, 0);

        setPeriod([...period, { id: Date.now(), start, end }]);
    };

    const removePeriod = (id) => {
        setPeriod(period.filter((p) => p.id !== id));
    };

    const updateStartDate = (id, date) => {
        setPeriod(period.map((p) => (p.id === id ? { ...p, start: date } : p)));
    };

    const updateEndDate = (id, date) => {
        setPeriod(period.map((p) => (p.id === id ? { ...p, end: date } : p)));
    };

    return (
        <div>
            <h2 className="period-title">Période(s) d'absence</h2>
            {period.map((p) => (
                <div key={p.id} className="period-card">
                    <div className="period-card-column">
                        <span className="period-card-label">DU</span>
                        <DatePicker
                            selected={p.start}
                            onChange={(date) => updateStartDate(p.id, date)}
                            locale="fr"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="dd MMM HH:mm"
                            className="custom-datepicker-input"
                            shouldCloseOnSelect={true}
                        />
                    </div>
                    <ArrowRight className="period-card-arrow-icon" size={20} />
                    <div className="period-card-column">
                        <span className="period-card-label">AU</span>
                        <DatePicker
                            selected={p.end}
                            onChange={(date) => updateEndDate(p.id, date)}
                            locale="fr"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="dd MMM HH:mm"
                            className="custom-datepicker-input"
                            shouldCloseOnSelect={true}
                        />
                    </div>
                    <button onClick={() => removePeriod(p.id)} title="Supprimer" className="remove-period-button">
                        <img src={trashIcon} alt="Delete" width="20" height="20" />
                    </button>
                </div>
            ))}
            <button onClick={addPeriod} className="add-period-button">
                + Ajouter une date/heure
            </button>
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
};

export default PeriodAbsence;
