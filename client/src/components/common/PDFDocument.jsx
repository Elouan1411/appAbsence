import { useState } from "react";
import { Document, Page } from "react-pdf";

const PDFDocument = ({ file }) => {
  const [numPages, setNumPages] = useState(null);

  if (!file) return null;

  return (
    <Document
      file={file}
      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
    >
      {Array.from({ length: numPages }, (_, i) => (
        <Page
          key={i}
          pageNumber={i + 1}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      ))}
    </Document>
  );
};

export default PDFDocument;
