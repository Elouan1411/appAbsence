import React, { useState, useEffect } from "react";
import PDFSection from "../ValidationJustification/PDFSection";
import { API_URL } from "../../config";
import CustomLoader from "../common/CustomLoader";

function JustificationAbsence({ justification }) {
    const [isPdfOpen, setPdfOpen] = useState(true);
    const [docIndex, setDocIndex] = useState(0);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setLoading] = useState(false);

    const file = documents.length > 0 ? documents[docIndex] : null;

    const handleLoadDocuments = async () => {
        setDocuments([]);
        setDocIndex(0);

        if (!justification || justification.liste_creneaux.length === 0) {
            return;
        }

        const id = Math.min(...justification.liste_creneaux.map((j) => j.id));

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
    }, [justification]);

    return (
        <div className="justification-absence-container">
            {isLoading ? (
                <CustomLoader />
            ) : (
                <>
                    <h2>Justification associée</h2>
                    <section className="section">
                        <div className="motif-box">
                            <span className="label">Motif déclaré</span>
                            <p className="motif-text">
                                <b>{justification.motif ?? "Aucun motif précisé."}</b>
                                {justification.commentaire ? ` : ${justification.commentaire}` : ""}
                            </p>
                        </div>
                    </section>
                    <section className="section">
                        <button className={`section-header ${isPdfOpen ? "active" : ""}`} onClick={() => setPdfOpen((o) => !o)}>
                            <h3 className="section-title">Documents justificatifs ({documents.length})</h3>
                            <span className={`chevron ${isPdfOpen ? "open" : ""}`} />
                        </button>

                        {isPdfOpen && <PDFSection file={file} setDocIndex={setDocIndex} docIndex={docIndex} documents={documents} isLoading={isLoading} />}
                    </section>
                </>
            )}
        </div>
    );
}

export default JustificationAbsence;
