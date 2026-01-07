import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFDocument({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  if (!file) return <p>Aucun document</p>;
  console.log(file);

  return (
    <div className="pdf-wrapper">
      <div className="pdf-container">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading="Chargement du PDF..."
        >
          <Page
            pageNumber={pageNumber}
            width={595}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>
      </div>
      <div className="pdf-toolbar">
        {pageNumber > 1 ? (
          <button
            onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
            disabled={pageNumber === 1}
          >
            <span className="icon-previous-button"></span>
          </button>
        ) : (
          <></>
        )}
        <span>
          Page {pageNumber} / {numPages}
        </span>
        {pageNumber > 1 ? (
          <button
            onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
            disabled={pageNumber === numPages}
          >
            <span className="icon-next-button"></span>
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
