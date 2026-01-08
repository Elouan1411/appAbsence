import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFDocument({ file }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    let height = 450;
    async function onDocumentLoadSuccess(pdf) {
        setNumPages(pdf.numPages);
        const page = await pdf.getPage(1);
        height = page.height;
    }

    if (!file) return <p>Aucun document</p>;
    console.log(file);

    return (
        <div className="pdf-content">
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
                        height={height}
                    />
                </Document>
            </div>
            <div className="pdf-buttons">
                <div className="pdf-toolbar">
                    {pageNumber > 1 ? (
                        <button
                            onClick={() =>
                                setPageNumber((p) => Math.max(p - 1, 1))
                            }
                            disabled={pageNumber === 1}
                        >
                            <span className="icon-previous-button"></span>
                        </button>
                    ) : (
                        <></>
                    )}
                    <span className="page-text">
                        Page {pageNumber} / {numPages}
                    </span>
                    {numPages > 1 ? (
                        <button
                            onClick={() =>
                                setPageNumber((p) => Math.min(p + 1, numPages))
                            }
                            disabled={pageNumber === numPages}
                        >
                            <span className="icon-next-button"></span>
                        </button>
                    ) : (
                        <></>
                    )}
                </div>
                <div className="download-button-container">
                    <button onClick={console.log("Ça télécharge")}>
                        <span className="icon-download"></span>
                    </button>
                </div>
            </div>
        </div>
    );
}
