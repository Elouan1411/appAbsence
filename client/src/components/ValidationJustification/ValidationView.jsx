import { useState, useEffect } from "react";
import { alertConfirm } from "../../hooks/alertConfirm";
import PersonalInfos from "./PersonalInfos";
import ListAbsence from "./ListAbsence";
import PDFSection from "./PDFSection";
import ValidationFooter from "./ValidationFooter";
import toast from "react-hot-toast";
import dateFormatter from "../../functions/dateFormatter";
import { API_URL } from "../../config";
import notify from "../../functions/notify";

export default function ValidationView({ selectedItem, reload }) {
    const [isLoading, setLoading] = useState(false);
    const [validationLoading, setValidationLoading] = useState(false);

    const [isHeaderOpen, setIsHeaderOpen] = useState(true);
    const [isPdfOpen, setPdfOpen] = useState(true);

    const [documents, setDocuments] = useState([]);
    const [docIndex, setDocIndex] = useState(0);

    const [listeAbsence, setListeAbsence] = useState([]);
    const [motif, setMotif] = useState("");

    const [absencesBySlot, setAbsencesBySlot] = useState({});

    if (!selectedItem) return null;

    const handleConfirmValidation = async () => {
        const result = await alertConfirm("Attention", "Êtes-vous surs de vouloir valider cette absence ?");
        if (result.isConfirmed) {
            handleUpdate(true);
        }
    };

    const handleConfirmRefuse = async () => {
        const result = await alertConfirm("Attention", "Êtes-vous surs de vouloir refuser cette absence ?", true);

        if (result.isConfirmed) {
            handleUpdate(false, result.motif, result.type);
        }
    };

    const handleUpdate = (validate, reason = "", type = 1) => {
        try {
            selectedItem.liste_creneaux.forEach(async (element) => {
                setValidationLoading(true);
                const response = await fetch(`${API_URL}/justification/validate/` + element.id, {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        value: validate ? "validate" : type == false ? "deny" : "modification",
                        reason: reason != "" ? reason : "Justificatifs valides",
                    }),
                });
            });
        } catch (error) {
            return;
        } finally {
            setValidationLoading(false);
            reload();
        }
    };

    const handleLoadDocuments = async () => {
        setDocuments([]);
        setDocIndex(0);

        if (!selectedItem.liste_creneaux || selectedItem.liste_creneaux.length === 0) {
            return;
        }

        const id = Math.min(...selectedItem.liste_creneaux.map((justification) => justification.id));

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/justification/documents/` + id, {
                method: "GET",
                credentials: "include",
            });

            const filesNameArray = await response.json();
            if (filesNameArray.length == 0) {
                setPdfOpen(false);
            }
            setDocuments(filesNameArray);
        } catch (error) {
            console.error("Erreur de chargement des documents", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleLoadDocuments();
    }, [selectedItem]);

    const file = documents.length > 0 ? documents[docIndex] : null;

    const handleLoadAbsences = async () => {
        try {
            const creneaux = selectedItem.liste_creneaux;

            if (!creneaux || creneaux.length === 0) return;

            const promises = creneaux.map(async (creneau, index) => {
                const params = new URLSearchParams({ debut: creneau.debut, fin: creneau.fin, numero: selectedItem.numeroEtudiant });
                const response = await fetch(`${API_URL}/absence/dates?${params.toString()}`, {
                    credentials: "include",
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) return { index, data: [] };

                const data = await response.json();

                return { index, data };
            });

            const results = await Promise.all(promises);

            const newAbsenceMap = {};
            results.forEach((res) => {
                newAbsenceMap[res.index] = res.data;
            });

            setAbsencesBySlot(newAbsenceMap);
        } catch (err) {
            console.error(err);
            notify("Impossible de charger les absences correspondantes", "error");
        }
    };

    useEffect(() => {
        handleLoadAbsences();
    }, [selectedItem]);

    return (
        <div className="validation-view-container">
            <div className="validation-view-content">
                <div className="validation-body-scroll">
                    <section className="section">
                        <button className={`section-header ${isHeaderOpen ? "active" : ""}`} onClick={() => setIsHeaderOpen((o) => !o)}>
                            <h3 className="section-title">Informations générales</h3>
                            <span className={`chevron ${isHeaderOpen ? "open" : ""}`} />
                        </button>

                        {isHeaderOpen && (
                            <div className="section-content fade-in">
                                <PersonalInfos selectedItem={selectedItem} />

                                <ListAbsence creneaux={selectedItem.liste_creneaux} absencesBySlot={absencesBySlot} />
                            </div>
                        )}
                    </section>

                    <section className="section">
                        <button className={`section-header ${isPdfOpen ? "active" : ""}`} onClick={() => setPdfOpen((o) => !o)}>
                            <h3 className="section-title">Documents justificatifs ({documents.length})</h3>
                            <span className={`chevron ${isPdfOpen ? "open" : ""}`} />
                        </button>

                        {isPdfOpen && <PDFSection file={file} setDocIndex={setDocIndex} docIndex={docIndex} documents={documents} isLoading={isLoading} />}
                    </section>
                </div>
            </div>

            <ValidationFooter handleConfirmRefuse={handleConfirmRefuse} handleConfirmValidation={handleConfirmValidation} isLoading={validationLoading} />
        </div>
    );
}
