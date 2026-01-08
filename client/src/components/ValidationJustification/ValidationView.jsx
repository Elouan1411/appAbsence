import { useState, useEffect } from "react";
import { alertConfirm } from "../../hooks/alertConfirm";
import PersonalInfos from "./PersonalInfos";
import ListAbsence from "./ListAbsence";
import PDFSection from "./PDFSection";
import ValidationFooter from "./ValidationFooter";

export default function ValidationView({ selectedItem, reload }) {
    const [isLoading, setLoading] = useState(false);
    const [validationLoading, setValidationLoading] = useState(false);

    const [isHeaderOpen, setIsHeaderOpen] = useState(true);
    const [isPdfOpen, setPdfOpen] = useState(true);

    const [documents, setDocuments] = useState([]);
    const [docIndex, setDocIndex] = useState(0);

    const [motif, setMotif] = useState("");

    if (!selectedItem) return null;

    const handleConfirmValidation = async () => {
        const confirmed = await alertConfirm("Attention", "Êtes-vous surs de vouloir valider cette absence ?");
        if (confirmed) {
            handleUpdate(true);
        }
    };

    const handleConfirmRefuse = async () => {
        const result = await alertConfirm("Attention", "Êtes-vous surs de vouloir refuser cette absence ?", true);

        if (result.isConfirmed) {
            handleUpdate(false, result.motif);
        }
    };

    const handleUpdate = (validate, reason = "") => {
        try {
            selectedItem.liste_creneaux.forEach(async (element) => {
                setValidationLoading(true);
                const response = await fetch("http://localhost:3000/justification/validate/" + element.id, {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        value: validate ? "validate" : "deny",
                        reason: reason != "" ? reason : "Justificatifs valides",
                    }),
                });
            });
        } catch (error) {
            console.log(error);
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
            const response = await fetch("http://localhost:3000/justification/documents/" + id, {
                method: "GET",
                credentials: "include",
            });

            const filesNameArray = await response.json();
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
                                <ListAbsence creneaux={selectedItem.liste_creneaux} />
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

            <ValidationFooter handleConfirmRefuse={handleConfirmRefuse} handleConfirmValidation={handleConfirmValidation} />
        </div>
    );
}
