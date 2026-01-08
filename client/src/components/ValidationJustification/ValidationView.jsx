import { useState, useEffect } from "react";
import Button from "../common/Button";
import PDFDocument from "../common/PDFDocument";
import dateFormatter from "../../functions/dateFormatter";
import CustomLoader from "../common/CustomLoader";
import { alertConfirm } from "../../hooks/alertConfirm";
const URL_FILE = "http://localhost:3000/upload/";

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
        const confirmed = await alertConfirm(
            "Attention",
            "Êtes-vous surs de vouloir valider cette absence ?"
        );
        if (confirmed) {
            handleUpdate(true);
        }
    };

    const handleConfirmRefuse = async () => {
        const result = await alertConfirm(
            "Attention",
            "Êtes-vous surs de vouloir refuser cette absence ?",
            true
        );

        if (result.isConfirmed) {
            handleUpdate(false, result.motif);
        }
    };

    const handleUpdate = (validate, reason = "") => {
        try {
            selectedItem.liste_creneaux.forEach(async (element) => {
                setValidationLoading(true);
                const response = await fetch(
                    "http://localhost:3000/justification/validate/" +
                        element.id,
                    {
                        method: "PUT",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            value: validate ? "validate" : "deny",
                            reason:
                                reason != "" ? reason : "Justificatifs valides",
                        }),
                    }
                );
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

        if (
            !selectedItem.liste_creneaux ||
            selectedItem.liste_creneaux.length === 0
        ) {
            return;
        }

        const id = Math.min(
            ...selectedItem.liste_creneaux.map(
                (justification) => justification.id
            )
        );

        try {
            setLoading(true);
            const response = await fetch(
                "http://localhost:3000/justification/documents/" + id,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

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
                        <button
                            className={`section-header ${
                                isHeaderOpen ? "active" : ""
                            }`}
                            onClick={() => setIsHeaderOpen((o) => !o)}
                        >
                            <h3 className="section-title">
                                Informations générales
                            </h3>
                            <span
                                className={`chevron ${
                                    isHeaderOpen ? "open" : ""
                                }`}
                            />
                        </button>

                        {isHeaderOpen && (
                            <div className="section-content fade-in">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">
                                            Numéro étudiant
                                        </span>
                                        <span className="value">
                                            {selectedItem.numeroEtudiant ?? "-"}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Nom</span>
                                        <span className="value">
                                            {selectedItem.nom ?? "-"}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Prénom</span>
                                        <span className="value">
                                            {selectedItem.prenom ?? "-"}
                                        </span>
                                    </div>
                                </div>
                                <div className="motif-box">
                                    <span className="label">Motif déclaré</span>
                                    <p className="motif-text">
                                        <b>
                                            {selectedItem.motif ??
                                                "Aucun motif précisé."}
                                        </b>
                                        {selectedItem.commentaire
                                            ? ` : ${selectedItem.commentaire}`
                                            : ""}
                                    </p>
                                </div>

                                <div className="creneaux-container">
                                    {selectedItem.liste_creneaux?.map(
                                        (creneau, index) => (
                                            <div
                                                className="date-item"
                                                key={index}
                                            >
                                                <div className="date-id">
                                                    <span className="id-absence">
                                                        Absence n° {index + 1}
                                                    </span>
                                                </div>
                                                <div className="date-content">
                                                    <span className="value">
                                                        <span className="label">
                                                            Date de début :{" "}
                                                        </span>
                                                        {dateFormatter(
                                                            creneau.debut ?? 0
                                                        )}
                                                    </span>
                                                    <span className="value">
                                                        <span className="label">
                                                            Date de fin :{" "}
                                                        </span>
                                                        {dateFormatter(
                                                            creneau.fin ?? 0
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="section">
                        <button
                            className={`section-header ${
                                isPdfOpen ? "active" : ""
                            }`}
                            onClick={() => setPdfOpen((o) => !o)}
                        >
                            <h3 className="section-title">
                                Documents justificatifs ({documents.length})
                            </h3>
                            <span
                                className={`chevron ${isPdfOpen ? "open" : ""}`}
                            />
                        </button>

                        {isPdfOpen && (
                            <div className="section-content pdf-wrapper fade-in">
                                {isLoading ? (
                                    <CustomLoader />
                                ) : documents.length > 0 ? (
                                    <>
                                        {documents.length > 1 && (
                                            <div className="doc-buttons-container">
                                                {documents.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        className={`doc-button ${
                                                            index === docIndex
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            setDocIndex(index)
                                                        }
                                                    >
                                                        Document {index + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="pdf-single-view">
                                            <PDFDocument
                                                key={file}
                                                file={URL_FILE + file}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <p>Aucun document trouvé</p>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <footer className="validation-footer">
                <div className="button-container">
                    <Button
                        className="action-button refuse-button"
                        onClick={handleConfirmRefuse}
                    >
                        Refuser
                    </Button>
                    <Button
                        className="action-button validate-button"
                        onClick={handleConfirmValidation}
                    >
                        Valider
                    </Button>
                </div>
            </footer>
        </div>
    );
}
