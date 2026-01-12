import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFDocument({ file }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const filename = file.split("/").pop();
    let height = 450;
    async function onDocumentLoadSuccess(pdf) {
        setNumPages(pdf.numPages);
        const page = await pdf.getPage(1);
        height = page.height;
    }

    const handleDownload = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(file);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = filename || "download";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erreur de téléchargement :", error);
            window.open(file, "_blank");
        }
    };

    if (!file) return <p>Aucun document</p>;
    console.log(file);

    return (
        <div className="pdf-content">
            <div className="pdf-container">
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess} loading="Chargement du PDF...">
                    <Page pageNumber={pageNumber} width={595} renderAnnotationLayer={false} renderTextLayer={false} height={height} />
                </Document>
            </div>
            <div className="pdf-buttons">
                <div className="pdf-toolbar">
                    {pageNumber > 1 ? (
                        <button onClick={() => setPageNumber((p) => Math.max(p - 1, 1))} disabled={pageNumber === 1}>
                            <span className="icon-previous-button"></span>
                        </button>
                    ) : (
                        <></>
                    )}
                    <span className="page-text">
                        Page {pageNumber} / {numPages}
                    </span>
                    {numPages > 1 && pageNumber < numPages ? (
                        <button onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))} disabled={pageNumber === numPages}>
                            <span className="icon-next-button"></span>
                        </button>
                    ) : (
                        <></>
                    )}
                </div>
                <div className="download-button-container">
                    <button onClick={handleDownload}>
                        <span className="icon-download"></span>
                    </button>
                </div>
            </div>
        </div>
    );
}
