import { use, useState, useEffect } from "react";
import Button from "../common/Button";
import ReactPDF, { PDFViewer } from "@react-pdf/renderer";
import PDFDocument from "../common/PDFDocument";
export default function ValidationModal({ isOpen, onClose, title, idAbsence }) {
  if (!isOpen) return null;

  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [file, setFile] = useState("");

  async function handleFetchJustification() {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3000/justification/admin/" + idAbsence,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Erreur HTTP " + response.status);

      const result = await response.json();
      console.log("Res: ", result);
      setData(result);
      setFile("http://localhost:3000/upload/" + result.list[0]);
    } catch (err) {
      console.error("Erreur de fetch: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleFetchJustification();
  }, []);

  return (
    <>
      {isLoading ? (
        <></>
      ) : (
        <div className="modal-overlay" onClick={onClose}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // empêche la fermeture au clic interne
          >
            <header className="modal-header">
              <h2>{title}</h2>
              <button className="modal-close" onClick={onClose}>
                ×
              </button>
            </header>

            <div className="modal-body">
              <div className="body-header">
                {data != null
                  ? `${data.numeroEtudiant} - ${data.nom} ${data.prenom}`
                  : ""}
              </div>
              <div className="body-content">
                <PDFDocument file={file} />
              </div>
              <div className="modal-buttons">
                <Button
                  className="validate-button"
                  onClick={console.log("Valider")}
                >
                  Valider
                </Button>
                <Button
                  className="refuse-button"
                  onClick={console.log("Refuser")}
                >
                  Refuser
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
