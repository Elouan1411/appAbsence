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

    const [status, setStatus] = useState(justification.validite);
    const [adminReason, setAdminReason] = useState(justification.motifValidite || "");
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [isSavingStatus, setIsSavingStatus] = useState(false);

    useEffect(() => {
        setStatus(justification.validite);
        setAdminReason(justification.motifValidite || "");
    }, [justification]);

    const handleUpdateStatus = async () => {
        try {
            setIsSavingStatus(true);
            const value = status === 0 ? "validate" : status === 1 ? "deny" : "pending";

            
            let apiValue = "pending";
            if (status == 0) apiValue = "validate";
            if (status == 1) apiValue = "deny";
            
            const response = await fetch(`${API_URL}/justification/validate/` + justification.idAbsJustifiee, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    value: apiValue,
                    reason: adminReason
                }),
            });

            if (response.ok) {
                setIsEditingStatus(false);
            } else {
                 console.error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setIsSavingStatus(false);
        }
    };

    const getStatusText = (val) => {
        switch(val) {
            case 0: return "Validée";
            case 1: return "Refusée";
            case 2: return "En cours";
            case 3: return "En attente de modification";
            default: return "Inconnu";
        }
    };

    const getStatusClass = (val) => {
        switch(val) {
            case 0: return "status-badge-validated";
            case 1: return "status-badge-refused";
            case 2: return "status-badge-pending";
            case 3: return "status-badge-pending"; 
            default: return "";
        }
    };

    return (
        <div className="justification-absence-container">
            {isLoading ? (
                <CustomLoader />
            ) : (
                <>
                    <h2>Justification associée</h2>
                    
                    <section className="section">
                        <div className="status-header" style={{ justifyContent: "space-between", marginBottom: "16px" }}>
                            <h3 className="section-title" style={{ margin: 0 }}>Statut de la justification</h3>
                            {!isEditingStatus && (
                                <button className="icon-button" onClick={() => setIsEditingStatus(true)} title="Modifier le statut">
                                    <span className="icon icon-edit" title="Modifier" ></span>
                                </button>
                            )}
                        </div>

                        {!isEditingStatus ? (
                            <div className="info-card">
                                <div className="info-card-header">
                                    <span className={`status-badge ${getStatusClass(status)}`}>
                                        {getStatusText(status)}
                                    </span>
                                </div>
                                {(status === 1 || status === 3) && adminReason && (
                                    <div className="admin-comment-section">
                                        <span className="admin-comment-label">Motif {status === 1 ? "du refus" : "de la demande"} :</span>
                                        <div className="admin-comment-box">{adminReason}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="info-card" style={{ borderColor: "var(--primary-color)" }}>
                                <div className="select-container-student" style={{ marginBottom: "16px" }}>
                                    <label className="select-label">Nouveau statut</label>
                                    <select 
                                        className="custom-select" 
                                        value={status} 
                                        onChange={(e) => setStatus(parseInt(e.target.value))}
                                    >
                                        <option value={0}>Validée</option>
                                        <option value={1}>Refusée</option>
                                        <option value={3}>En attente de modification</option>
                                    </select>
                                </div>

                                {(status === 1 || status === 3) && (
                                    <div className="reason-input">
                                        <label className="select-label">Motif / Commentaire</label>
                                        <textarea
                                            className="custom-textarea"
                                            value={adminReason}
                                            onChange={(e) => setAdminReason(e.target.value)}
                                            placeholder="Ex: Justificatif illisible, veuillez en fournir un autre..."
                                        />
                                    </div>
                                )}

                                <div className="button-container" style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "flex-end" }}>
                                    <button 
                                        className="delete-button" 
                                        onClick={() => {
                                            setIsEditingStatus(false);
                                            setStatus(justification.validite);
                                            setAdminReason(justification.motifValidite || "");
                                        }}
                                        style={{ width: "auto", padding: "8px 16px", height: "auto" }}
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        className="save-student-button" 
                                        onClick={handleUpdateStatus}
                                        disabled={isSavingStatus}
                                        style={{ width: "auto", padding: "8px 16px", height: "auto", display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        {isSavingStatus ? <span className="loader"></span> : <span>Enregistrer</span>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="section">
                        <div className="motif-box">
                            <span className="label">Motif déclaré par l'étudiant</span>
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
