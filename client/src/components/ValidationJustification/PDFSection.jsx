import React from "react";
import CustomLoader from "../common/CustomLoader";
import PDFDocument from "../common/PDFDocument";

const URL_FILE = "http://localhost:3000/upload/";

function PDFSection({ setDocIndex, file, isLoading, docIndex, documents }) {
    return (
        <div className="section-content pdf-wrapper fade-in">
            {isLoading ? (
                <CustomLoader />
            ) : documents.length > 0 ? (
                <>
                    {documents.length > 1 && (
                        <div className="doc-buttons-container">
                            {documents.map((_, index) => (
                                <button key={index} className={`doc-button ${index === docIndex ? "active" : ""}`} onClick={() => setDocIndex(index)}>
                                    Document {index + 1}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="pdf-single-view">
                        <PDFDocument key={file} file={URL_FILE + file} />
                    </div>
                </>
            ) : (
                <p>Aucun document trouvé</p>
            )}
        </div>
    );
}

export default PDFSection;
