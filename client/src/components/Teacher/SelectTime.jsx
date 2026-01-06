import React, { useState, useEffect } from "react";
import "../../style/SelectGroups.css";

function SelectTime({ onChange, style }) {
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const timeSlots = [
        "08:00", "09:30","11:00","12:30", "13:30", "15:00","16:30", "18:00"
    ];

    useEffect(() => {
        const now = new Date();
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;
        setDate(todayStr);

        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        let selectedSlot = timeSlots[0];
        
        for (let slot of timeSlots) {
            const [h, m] = slot.split(":").map(Number);
            const slotTotalMinutes = h * 60 + m;

            if (currentTotalMinutes >= slotTotalMinutes) {
                selectedSlot = slot;
            } else {
                break;
            }
        }

        setStartTime(selectedSlot);
        setEndTime(addMinutes(selectedSlot, 90));
    }, []);

    const addMinutes = (timeStr, minutesToAdd) => {
        if (!timeStr) return "";
        const [h, m] = timeStr.split(":").map(Number);
        const date = new Date();
        date.setHours(h);
        date.setMinutes(m + minutesToAdd);
        
        const newH = String(date.getHours()).padStart(2, "0");
        const newM = String(date.getMinutes()).padStart(2, "0");
        return `${newH}:${newM}`;
    };

    useEffect(() => {
        if (onChange) {
            onChange({ date, startTime, endTime });
        }
    }, [date, startTime, endTime]);

    const handleStartTimeChange = (e) => {
        const newStart = e.target.value;
        setStartTime(newStart);
        setEndTime(addMinutes(newStart, 90)); 
    };

    return (
        <div className="Card cols-3" style={{ height: "fit-content", ...style }}>
            <h2>Date et Heure</h2>
            
            <div className="input-group">
                <label htmlFor="date">Date</label>
                <input 
                    type="date" 
                    id="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                        backgroundColor: "var(--background-color)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--text-secondary)",
                        borderRadius: "8px",
                        padding: "0.75rem 1rem",
                        fontSize: "1rem",
                        outline: "none"
                    }}
                />
            </div>

            <datalist id="time-slots">
                {timeSlots.map(time => (
                    <option key={time} value={time} />
                ))}
            </datalist>

            <div className="input-group">
                <label htmlFor="startTime">Début</label>
                <input 
                    type="time" 
                    id="startTime" 
                    list="time-slots"
                    value={startTime} 
                    onChange={handleStartTimeChange}
                    style={{
                        backgroundColor: "var(--background-color)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--text-secondary)",
                        borderRadius: "8px",
                        padding: "0.75rem 1rem",
                        fontSize: "1rem",
                        outline: "none"
                    }}
                />
            </div>

            <div className="input-group">
                <label htmlFor="endTime">Fin</label>
                <input 
                    type="time" 
                    id="endTime" 
                    list="time-slots"
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{
                        backgroundColor: "var(--background-color)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--text-secondary)",
                        borderRadius: "8px",
                        padding: "0.75rem 1rem",
                        fontSize: "1rem",
                        outline: "none"
                    }}
                />
            </div>
        </div>
    );
}

export default SelectTime;
