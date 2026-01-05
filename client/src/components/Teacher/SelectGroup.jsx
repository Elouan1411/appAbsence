import React, { useState, useEffect } from "react";

function SelectGroup() {
    const [promos, setPromos] = useState([]);
    const [TD, setTD] = useState([]);
    const [TP, setTP] = useState([]);
    const [selectedPromo, setSelectedPromo] = useState("");
    const [selectedSemestre, setSelectedSemestre] = useState("");
    const [selectedTD, setSelectedTD] = useState("");
    const [selectedTP, setSelectedTP] = useState("");

    useEffect(() => {
        async function fetchPromos() {
            try {
                const response = await fetch("http://localhost:3000/teacher/promo", {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setPromos(data); 
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchPromos();
    }, []);

    async function fetchGroups() {
        try {
            const response = await fetch("http://localhost:3000/teacher/groups/" + selectedPromo + "/" + selectedSemestre, {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                data.array.forEach(el => {
                    if (el.substring(1, 2) === "D") {
                        setTD(previousTD => [...previousTD, el]); 
                    } else {
                        setTP(previousTP => [...previousTP, el]); 
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleChangePromo = (event) => {
        console.log("Nouvelle promo sélectionnée :", event.target.value);
        setSelectedPromo(event.target.value);
        setTD([]);
        setTP([]);
    };

    const handleChangeSemestre = (event) => {
        console.log("Nouveau semestre sélectionné :", event.target.value);
        setSelectedSemestre(event.target.value);
        setTD([]);
        setTP([]);
    };

    const handleChangeTD = (event) => {
        console.log("Nouveau groupe TD sélectionné :", event.target.value);
        setSelectedTD(event.target.value);
    };

    const handleChangeTP = (event) => {
        console.log("Nouveau groupe TP sélectionné :", event.target.value);
        setSelectedTP(event.target.value);
    };

    return (
        <div>
            <h2>Selectionner un groupe</h2>
            <label htmlFor="Promo">Promotion</label>
            
            <select onChange={handleChangePromo} value={selectedPromo}>
                {selectedPromo === "" && <option value="">-- Choisir --</option>}
                {promos.map((promo) => (
                    <option key={promo.promo} value={promo.promo}>
                        {promo.promo}
                    </option>
                ))}
            </select>
            
            <label htmlFor="Semestre">Semestre</label>
            <select onChange={handleChangeSemestre} value={selectedSemestre}>
                <option value="false">Semestre Impair</option>
                <option value="true">Semestre Pair</option>
            </select>

            <h2>TD</h2>
            <select onChange={handleChangeTD} value={selectedTD}>
                {selectedTD === "" && <option value="">-- Choisir --</option>}
                {TD.map((td) => (
                    <option key={td.groupeTD} value={td.groupeTD}>
                        {td.groupeTD}
                    </option>
                ))}
            </select>

            <h2>TP</h2>
            <select onChange={handleChangeTP} value={selectedTP}>
                {selectedTP === "" && <option value="">-- Choisir --</option>}
                {TP.map((tp) => (
                    <option key={tp.groupeTP} value={tp.groupeTP}>
                        {tp.groupeTP}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SelectGroup;