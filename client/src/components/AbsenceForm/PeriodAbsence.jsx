import React from "react";
import "../../style/Student.css";
import "../../style/StudentMobile.css";
import trashIcon from "../../assets/trash.svg";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, subDays, setHours, setMinutes } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

registerLocale("fr", fr);

const PeriodAbsence = ({ period, setPeriod, errors, error, automaticPeriod, readOnly }) => {
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

        setPeriod([...period, { id: Date.now(), start, end, isNew: true }]);
    };

    const removePeriod = (id) => {
        setPeriod(period.filter((p) => p.id !== id));
    };

    const updateStartDate = (id, newStart) => {
        if (!newStart) return;

        setPeriod(
            period.map((p) => {
                if (p.id !== id) return p;

                let newEnd = p.end;

                if (newStart > p.end) {
                    const theDayAfter = addDays(newStart, 1);
                    const theDayAfterSameHour = setHours(theDayAfter, p.end.getHours());
                    newEnd = setMinutes(theDayAfterSameHour, p.end.getMinutes());
                }

                return { ...p, start: newStart, end: newEnd };
            }),
        );
    };

    const updateEndDate = (id, newEnd) => {
        if (!newEnd) return;

        setPeriod(
            period.map((p) => {
                if (p.id !== id) return p;

                let newStart = p.start;

                if (newEnd < p.start) {
                    const theDayBefore = subDays(newEnd, 1);
                    const theDayBeforeSameHour = setHours(theDayBefore, p.start.getHours());
                    newStart = setMinutes(theDayBeforeSameHour, p.start.getMinutes());
                }

                return { ...p, start: newStart, end: newEnd };
            }),
        );
    };

    return (
        <div>
            <h3 className="section-title-student section-title-student-period">Période(s) d'absence</h3>
            <AnimatePresence initial={false} mode="popLayout">
                {period.map((p) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={p.id}
                        className={`period-card ${errors[p.id] ? "period-error" : ""}`}
                        title={errors[p.id] || ""}
                    >
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
                                className={`custom-datepicker-input ${readOnly ? "custom-datepicker-input-readonly" : ""}`}
                                shouldCloseOnSelect={true}
                                readOnly={readOnly}
                            />
                        </div>
                        <span className="icon icon-arrow-right icon-xl period-card-arrow-icon" />
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
                                className={`custom-datepicker-input ${readOnly ? "custom-datepicker-input-readonly" : ""}`}
                                shouldCloseOnSelect={true}
                                readOnly={readOnly}
                            />
                        </div>
                        {!readOnly && (
                            <button onClick={() => removePeriod(p.id)} title="Supprimer" className="remove-period-button">
                                <img src={trashIcon} alt="Delete" width="20" height="20" />
                            </button>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
            {!readOnly && (
                <button onClick={addPeriod} className={`add-period-button ${error ? "input-error" : ""}`}>
                    {period.length < 1 ? "+ Ajouter une date/heure" : "+ Ajouter une autre date/heure (pour le même motif/justificatif)"}
                </button>
            )}
        </div>
    );
};

export default PeriodAbsence;
