import React, { useState } from "react";
import "../../style/Student.css";
import toast, { Toaster } from "react-hot-toast";
import trashIcon from "../../assets/trash.svg";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowRight } from "lucide-react";
import { addDays, subDays, setHours, setMinutes } from "date-fns";

registerLocale("fr", fr);

const PeriodAbsence = () => {
    const [period, setPeriod] = useState([]);
    const [errors, setErrors] = useState({});

    const addPeriod = () => {
        let baseDate = new Date();

        if (period.length > 0) {
            const lastPeriodEnd = new Date(Math.max(...period.map((p) => p.end)));
            baseDate = new Date(lastPeriodEnd);
            baseDate.setDate(baseDate.getDate() + 1);
        }

        const start = new Date(baseDate);
        start.setHours(8, 0, 0, 0);

        const end = new Date(baseDate);
        end.setHours(18, 0, 0, 0);

        mySetPeriod([...period, { id: Date.now(), start, end }]);
    };

    const mySetPeriod = (newPeriods) => {
        setPeriod(newPeriods);
        checkPeriod(newPeriods);
    };

    const removePeriod = (id) => {
        mySetPeriod(period.filter((p) => p.id !== id));
    };

    const updateStartDate = (id, newStart) => {
        if (!newStart) return;

        mySetPeriod(
            period.map((p) => {
                if (p.id !== id) return p;

                let newEnd = p.end;

                if (newStart > p.end) {
                    const theDayAfter = addDays(newStart, 1);
                    const theDayAfterSameHour = setHours(theDayAfter, p.end.getHours());
                    newEnd = setMinutes(theDayAfterSameHour, p.end.getMinutes());
                }

                return { ...p, start: newStart, end: newEnd };
            })
        );
    };

    const updateEndDate = (id, newEnd) => {
        if (!newEnd) return;

        mySetPeriod(
            period.map((p) => {
                if (p.id !== id) return p;

                let newStart = p.start;

                if (newEnd < p.start) {
                    const theDayBefore = subDays(newEnd, 1);
                    const theDayBeforeSameHour = setHours(theDayBefore, p.start.getHours());
                    newStart = setMinutes(theDayBeforeSameHour, p.start.getMinutes());
                }

                return { ...p, start: newStart, end: newEnd };
            })
        );
    };

    const periodsOverlap = (p1, p2) => {
        if (!p1.start || !p1.end || !p2.start || !p2.end) return false;
        return p1.start < p2.end && p2.start < p1.end;
    };

    const checkPeriod = (currentPeriods = period) => {
        const newErrors = {};
        const overlapErrorMsg = "Les périodes se chevauchent";
        const invalidDateErrorMsg = "La date de fin doit être postérieure au début";
        let hasOverlap = false;
        let hasInvalidDate = false;
        setErrors({});
        for (let i = 0; i < currentPeriods.length; i++) {
            const p1 = currentPeriods[i];

            // Check if start >= end
            if (p1.start >= p1.end) {
                newErrors[p1.id] = invalidDateErrorMsg;
                hasInvalidDate = true;
            }

            // Check for overlaps
            for (let j = i + 1; j < currentPeriods.length; j++) {
                const p2 = currentPeriods[j];
                if (periodsOverlap(p1, p2)) {
                    if (!newErrors[p1.id]) newErrors[p1.id] = overlapErrorMsg;
                    if (!newErrors[p2.id]) newErrors[p2.id] = overlapErrorMsg;

                    hasOverlap = true;
                }
            }
        }

        setErrors(newErrors);
        toast.dismiss();

        if (hasInvalidDate) {
            toast.error(invalidDateErrorMsg);
            return false;
        }
        if (hasOverlap) {
            toast.error(overlapErrorMsg);
            return false;
        }

        return true;
    };

    return (
        <div>
            <h2 className="period-title">Période(s) d'absence</h2>
            {period.map((p) => (
                <div key={p.id} className={`period-card ${errors[p.id] ? "period-error" : ""}`} title={errors[p.id] || ""}>
                    <div className="period-card-column">
                        <span className="period-card-label">DU</span>
                        <DatePicker
                            selected={p.start}
                            onChange={(date) => updateStartDate(p.id, date)}
                            locale="fr"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={30}
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
                            timeIntervals={30}
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
                {period.length < 1 ? "+ Ajouter une date/heure" : "+ Ajouter une autre date/heure (pour le même motif/justificatif)"}
            </button>
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
};

export default PeriodAbsence;
