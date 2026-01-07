import { useState, useEffect } from "react";
import Button from "../common/Button";
import PDFDocument from "../common/PDFDocument";
import dateFormatter from "../../functions/dateFormatter";

export default function ValidationView({ idAbsence }) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [file, setFile] = useState("");

  const [isHeaderOpen, setIsHeaderOpen] = useState(true);
  const [isPdfOpen, setPdfOpen] = useState(true);

  async function handleFetchJustification() {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/justification/admin/${idAbsence}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const result = await response.json();
      setData(result);
      if (result.list && result.list.length > 0) {
        setFile(`http://localhost:3000/upload/${result.list[0]}`);
      }
    } catch (err) {
      console.error("Erreur de fetch :", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleFetchJustification();
  }, []);

  // Optionnel : Afficher un loader si isLoading est true, sinon null
  if (isLoading || !data) return null;

  return (
    <div className="validation-view-container">
      <div
        className="validation-view-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="validation-body-scroll">
          <section className="accordion-section">
            <button
              className={`accordion-trigger ${isHeaderOpen ? "active" : ""}`}
              onClick={() => setIsHeaderOpen((o) => !o)}
            >
              <h3 className="section-title">Informations générales</h3>
              <span className={`chevron ${isHeaderOpen ? "open" : ""}`} />
            </button>

            {isHeaderOpen && (
              <div className="accordion-content fade-in">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Numéro étudiant</span>
                    <span className="value">{data.numeroEtudiant ?? "-"}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Nom</span>
                    <span className="value">{data.nom ?? "-"}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Prénom</span>
                    <span className="value">{data.prenom ?? "-"}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Début</span>
                    <span className="value">
                      {dateFormatter(data.debut ?? 0)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Fin</span>
                    <span className="value">
                      {dateFormatter(data.fin ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="motif-box">
                  <span className="label">Motif déclaré</span>
                  <p className="motif-text">
                    {data.motif ?? "Aucun motif précisé."}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="accordion-section">
            <button
              className={`accordion-trigger ${isPdfOpen ? "active" : ""}`}
              onClick={() => setPdfOpen((o) => !o)}
            >
              <h3 className="section-title">
                Documents justificatifs ({data.list?.length || 0})
              </h3>
              <span className={`chevron ${isPdfOpen ? "open" : ""}`} />
            </button>

            {isPdfOpen && (
              <div className="accordion-content pdf-wrapper fade-in">
                <PDFDocument file={file} />
              </div>
            )}
          </section>
        </div>

        <footer className="modal-footer">
          <Button
            className="action-button refuse-button"
            onClick={() => console.log("Refuser")}
          >
            Refuser
          </Button>
          <Button
            className="action-button validate-button"
            onClick={() => console.log("Valider")}
          >
            Valider
          </Button>
        </footer>
      </div>
    </div>
  );
}
