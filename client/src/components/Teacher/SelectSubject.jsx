import React, { useState, useEffect } from "react";
import "../../style/SelectGroups.css";
import { API_URL } from "../../config";

function SelectSubject({ onSelect, promo, pair, style, value }) {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(value || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (value !== undefined) {
            setSelectedSubject(value);
        }
    }, [value]);

    useEffect(() => {
        async function fetchSubjects() {
            if (!promo) {
                setSubjects([]);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/subject/promo`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ promo, pair }),
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setSubjects(data);
                }
            } catch (err) {
                console.error("Error fetching subjects:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSubjects();
    }, [promo, pair]);

    const handleChange = (e) => {
        const val = e.target.value;
        setSelectedSubject(val);
        if (onSelect) {
            onSelect(val);
        }
    };

    return (
        <div className="Card cols-1" style={{ height: "fit-content", ...style }}>
            <h2>Matière</h2>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className="input-group">
                    <label htmlFor="subject">Choix</label>
                    <select id="subject" value={selectedSubject} onChange={handleChange}>
                        <option value="">-- Choisir --</option>
                        {subjects.map((sub) => (
                        <option key={sub.code} value={sub.code}>
                            {sub.libelle}
                        </option>
                    ))}
                </select>
            </div>
            )}
        </div>
    );
}

export default SelectSubject;
