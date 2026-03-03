import React from "react";
import "../../style/Student.css";
import "../../style/StudentMobile.css";
import fileIcon from "../../assets/file_document.svg";
import downloadIcon from "../../assets/download.svg";

const FileReadOnlyList = ({ files }) => {
    const downloadFile = (e, file) => {
        e.preventDefault();
        e.stopPropagation();
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <div className="files-section-readonly" style={{ marginTop: "20px" }}>
            <h3 className="section-title-student">Fichiers justificatifs</h3>
            {files.length > 0 ? (
                <div className="file-list">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="file-item file-item-readonly"
                            onClick={(e) => downloadFile(e, file)}
                            style={{ cursor: "pointer" }}
                            title="Télécharger le fichier"
                        >
                            <div className="file-info">
                                <span className="file-icon pdf-icon">
                                    <img src={fileIcon} alt="File" width="20" height="20" />
                                </span>
                                <div className="file-details">
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">{formatFileSize(file.size)}</span>
                                </div>
                            </div>
                            <span className="file-action-icon">
                                <div
                                    className="icon-download"
                                    style={{
                                        maskImage: `url(${downloadIcon})`,
                                        WebkitMaskImage: `url(${downloadIcon})`,
                                    }}
                                 title="Télécharger" /> 
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-files-text">Aucun fichier joint.</p>
            )}
        </div>
    );
};

export default FileReadOnlyList;
