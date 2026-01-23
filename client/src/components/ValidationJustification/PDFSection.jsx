import React from "react";
import CustomLoader from "../common/CustomLoader";
import PDFDocument from "../common/PDFDocument";
import PDFTabs from "./PDFTabs";
import { API_URL } from "../../config";

const URL_FILE = `${API_URL}/upload/justification/`;

function PDFSection({ setDocIndex, file, isLoading, docIndex, documents }) {
    const tabs = documents.map((doc, index) => ({
        id: index,
        label: `Document ${index + 1}`,
    }));

    return (
        <div className="section-content pdf-wrapper fade-in">
            {isLoading ? (
                <CustomLoader />
            ) : documents.length > 0 ? (
                <>
                    {documents.length > 1 && <PDFTabs activeTab={docIndex} setActiveTab={setDocIndex} tabs={tabs} />}

                    <div className="pdf-single-view">{file && <PDFDocument key={file} file={URL_FILE + file} />}</div>
                </>
            ) : (
                <p>Aucun document trouvé</p>
            )}
        </div>
    );
}

export default PDFSection;
