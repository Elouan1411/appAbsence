import { useState, useEffect } from "react";
import Button from "../common/Button";
import PDFDocument from "../common/PDFDocument";
import dateFormatter from "../../functions/dateFormatter";
import CustomLoader from "../common/CustomLoader";
import { alertConfirm } from "../../hooks/alertConfirm";
import toast, { Toaster } from "react-hot-toast";

export default function ValidationView({ selectedItem }) {
  console.log(selectedItem.liste_creneaux);
  const [data, setData] = useState(selectedItem);
  console.log("Data liste creneaux : ", data.liste_creneaux);
  const [isLoading, setLoading] = useState(false);
  const [file, setFile] = useState("");

  data.liste_creneaux.forEach((creneau) => {
    console.log(`Créneau ${creneau.id} : `, creneau);
  });

  const [isHeaderOpen, setIsHeaderOpen] = useState(true);
  const [isPdfOpen, setPdfOpen] = useState(true);

  if (isLoading || !data) {
    if (isLoading) {
      return <CustomLoader />;
    } else {
      return null;
    }
  }

  const handleConfirmValidation = async () => {
    const confirmed = await alertConfirm(
      "Attention",
      "Êtes-vous surs de vouloir sauvegarder ?"
    );
    if (confirmed) {
      handleValidate();
    }
  };

  const handleValidate = () => {
    console.log("Je valide");
  };
  return (
    <div className="validation-view-container">
      <div className="validation-view-content">
        <div className="validation-body-scroll">
          <section className="section">
            <button
              className={`section-header ${isHeaderOpen ? "active" : ""}`}
              onClick={() => setIsHeaderOpen((o) => !o)}
            >
              <h3 className="section-title">Informations générales</h3>
              <span className={`chevron ${isHeaderOpen ? "open" : ""}`} />
            </button>

            {isHeaderOpen && (
              <div className="section-content fade-in">
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
                </div>
                <div className="motif-box">
                  <span className="label">Motif déclaré</span>
                  <p className="motif-text">
                    {data.motif ?? "Aucun motif précisé."}
                  </p>
                </div>

                <div className="creneaux-container">
                  {data.liste_creneaux?.map((creneau, index) => (
                    <div className="date-item" key={index}>
                      {" "}
                      <div className="date-id">
                        <span className="id-absence">
                          Absence n° {index + 1}
                        </span>
                      </div>
                      <div className="date-content">
                        <span className="value">
                          <span className="label">Date de début : </span>
                          {dateFormatter(creneau.debut ?? 0)}
                        </span>
                        <span className="value">
                          <span className="label">Date de fin : </span>
                          {dateFormatter(creneau.fin ?? 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="section">
            <button
              className={`section-header ${isPdfOpen ? "active" : ""}`}
              onClick={() => setPdfOpen((o) => !o)}
            >
              <h3 className="section-title">
                Documents justificatifs ({data.list?.length || 0})
              </h3>
              <span className={`chevron ${isPdfOpen ? "open" : ""}`} />
            </button>

            {isPdfOpen && (
              <div className="section-content pdf-wrapper fade-in">
                <PDFDocument file={file} />
              </div>
            )}
          </section>
        </div>
      </div>
      <footer className="validation-footer">
        <div className="button-container">
          <Button
            className="action-button refuse-button"
            onClick={() => console.log("Refuser")}
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
      <Toaster />
    </div>
  );
}
