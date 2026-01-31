import React, { useState, useEffect } from "react";
import "../../style/SelectGroups.css";
import { API_URL } from "../../config";


function SelectGroup({ onValidate, date, style, initialSelection }) {
    const [promos, setPromos] = useState([]);
    const [TD, setTD] = useState([]);
    const [TP, setTP] = useState([]);

    const getSemesterFromDate = (dateStr) => {
        let month;
        if (dateStr) {
            month = new Date(dateStr).getMonth();
        } else {
            month = new Date().getMonth();
        }
        if (month >= 8) return "0";
        return "1";
    };

    const [selectedPromo, setSelectedPromo] = useState("");
    const [selectedSemestre, setSelectedSemestre] = useState(() => getSemesterFromDate(date));
    const [selectedTD, setSelectedTD] = useState("");
    const [selectedTP, setSelectedTP] = useState("");
    const [isLoadingPromos, setLoadingPromos] = useState(false);
    const [isLoadingGroups, setLoadingGroups] = useState(false);

    useEffect(() => {
        if (initialSelection) {
            console.log("Setting initial selection:", initialSelection);
            setSelectedPromo(initialSelection.promo || "");

            if (initialSelection.semestre) {
                setSelectedSemestre(initialSelection.semestre);
            }

            setSelectedTD(initialSelection.groupeTD || "");
            setSelectedTP(initialSelection.groupeTP || "");

            if (initialSelection.promo && initialSelection.semestre) {
                fetchGroups(initialSelection.promo, initialSelection.semestre);
            }
        }
    }, [initialSelection]);

    useEffect(() => {
        if (date) {
            const newSemestre = getSemesterFromDate(date);
            if (newSemestre !== selectedSemestre) {
                setSelectedSemestre(newSemestre);
                if (selectedPromo) {
                    fetchGroups(selectedPromo, newSemestre);
                }
            }
        }
    }, [date]);

    useEffect(() => {
        async function fetchPromos() {
            let timer;
            try {
                timer = setTimeout(() => setLoadingPromos(true), 200);
                const response = await fetch(`${API_URL}/groups/promo`, {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setPromos(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                clearTimeout(timer);
                setLoadingPromos(false);
            }
        }
        fetchPromos();
    }, []);

    async function fetchGroups(promo, semestre) {
        if (!promo || !semestre) return;
        let timer;
        try {
            timer = setTimeout(() => setLoadingGroups(true), 200);
            const link = `${API_URL}/groups/groups/` + promo + "/" + semestre;
            const response = await fetch(link, {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();

                const isPair = semestre === "true" || semestre === "1";
                const tdKey = isPair ? "groupeTDPair" : "groupeTD";
                const tpKey = isPair ? "groupeTPPair" : "groupeTP";

                const uniqueTDs = [];
                const uniqueTPs = [];

                data.forEach((item) => {
                    const valTD = item[tdKey];
                    const valTP = item[tpKey];

                    if (valTD && !uniqueTDs.find((obj) => obj.groupeTD === valTD)) {
                        uniqueTDs.push({ groupeTD: valTD });
                    }
                    if (valTP && !uniqueTPs.find((obj) => obj.groupeTP === valTP)) {
                        uniqueTPs.push({ groupeTP: valTP });
                    }
                });

                setTD(uniqueTDs);
                setTP(uniqueTPs);
            }
        } catch (err) {
            console.error(err);
        } finally {
            clearTimeout(timer);
            setLoadingGroups(false);
        }
    }

    const handleChangePromo = (event) => {
        const newPromo = event.target.value;
        console.log("Nouvelle promo sélectionnée :", newPromo);
        setSelectedPromo(newPromo);
        setTD([]);
        setTP([]);
        if (selectedSemestre !== "") {
            fetchGroups(newPromo, selectedSemestre);
        }
    };

    const handleChangeSemestre = (event) => {
        const newSemestre = event.target.value;
        console.log("Nouveau semestre sélectionné :", newSemestre);
        setSelectedSemestre(newSemestre);
        setTD([]);
        setTP([]);
        if (selectedPromo !== "") {
            fetchGroups(selectedPromo, newSemestre);
        }
    };

    const handleChangeTD = (event) => {
        console.log("Nouveau groupe TD sélectionné :", event.target.value);
        setSelectedTD(event.target.value);
    };

    const handleChangeTP = (event) => {
        console.log("Nouveau groupe TP sélectionné :", event.target.value);
        setSelectedTP(event.target.value);
    };

    useEffect(() => {
        if (onValidate) {
            onValidate({
                promo: selectedPromo,
                semestre: selectedSemestre,
                groupeTD: selectedTD,
                groupeTP: selectedTP,
            });
        }
    }, [selectedPromo, selectedSemestre, selectedTD, selectedTP]);

    return (
        <div className="Card cols-4">
            <h2>Selectionner un groupe</h2>

            <div className="input-group">
                <label htmlFor="Promo">Promotion</label>
                <select onChange={handleChangePromo} value={selectedPromo} disabled={isLoadingPromos}>
                    {isLoadingPromos ? (
                        <option>Chargement...</option>
                    ) : (
                        <>
                            {selectedPromo === "" && <option value="">-- Choisir --</option>}
                            {promos.map((promo) => (
                                <option key={promo.promo} value={promo.promo}>
                                    {promo.promo}
                                </option>
                            ))}
                        </>
                    )}
                </select>
            </div>

            <div className="input-group">
                <label htmlFor="Semestre">Semestre</label>
                <select onChange={handleChangeSemestre} value={selectedSemestre}>
                    <option value="0">Semestre Impair</option>
                    <option value="1">Semestre Pair</option>
                </select>
            </div>

            <div className="input-group">
                <label htmlFor="TD">TD</label>
                <select onChange={handleChangeTD} value={selectedTD} disabled={isLoadingGroups}>
                    {isLoadingGroups ? (
                        <option>Chargement...</option>
                    ) : (
                        <>
                            <option value="">-- Tous --</option>
                            {TD.map((td) => (
                                <option key={td.groupeTD} value={td.groupeTD}>
                                    {td.groupeTD}
                                </option>
                            ))}
                        </>
                    )}
                </select>
            </div>

            <div className="input-group">
                <label htmlFor="TP">TP</label>
                <select onChange={handleChangeTP} value={selectedTP} disabled={isLoadingGroups}>
                    {isLoadingGroups ? (
                        <option>Chargement...</option>
                    ) : (
                        <>
                            <option value="">-- Tous --</option>
                            {TP.map((tp) => (
                                <option key={tp.groupeTP} value={tp.groupeTP}>
                                    {tp.groupeTP}
                                </option>
                            ))}
                        </>
                    )}
                </select>
            </div>
        </div>
    );
}

export default SelectGroup;
