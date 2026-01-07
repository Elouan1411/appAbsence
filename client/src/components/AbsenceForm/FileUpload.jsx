import React, { useState, useRef } from "react";
import "../../style/Student.css";
import cloudIcon from "../../assets/upload_cloud.svg";
import fileIcon from "../../assets/file_document.svg";
import checkIcon from "../../assets/check_success.svg";
import trashIcon from "../../assets/trash.svg";
import toast, { Toaster } from "react-hot-toast";

const FileUpload = ({ files, setFiles }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
    };

    const truncateFileName = (name, maxLength = 20) => {
        // for toast
        if (name.length <= maxLength) return name;
        const extension = name.split(".").pop();
        const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
        const half = Math.floor((maxLength - 3 - extension.length - 1) / 2);
        return `${nameWithoutExt.substring(0, half)}...${nameWithoutExt.slice(-half)}.${extension}`;
    };

    const addFiles = (newFiles) => {
        const MAX_SIZE = 15 * 1024 * 1024; // 15MB
        const validFiles = newFiles.filter((file) => {
            if (file.size > MAX_SIZE) {
                toast.error(`Le fichier ${truncateFileName(file.name)} dépasse la limite de 15Mo.`);
                return false;
            }
            toast.success(`Le fichier ${truncateFileName(file.name)} a été ajouté.`);
            return true;
        });

        if (validFiles.length > 0) {
            setFiles((prev) => [...prev, ...validFiles]);
        }
    };

    const removeFile = (fileToRemove) => {
        setFiles((prev) => prev.filter((file) => file !== fileToRemove));
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const downloadFile = (e, file) => {
        e.stopPropagation();
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="file-upload-container">
                <h2 className="file-upload-title">
                    Justificatifs <span className="optional-text">(Optionnel)</span>
                </h2>

                <div
                    className={`dropzone ${isDragging ? "dragging" : ""}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} multiple />

                    <div className="cloud-icon-container">
                        <img src={cloudIcon} alt="Upload" width="24" height="24" />
                    </div>

                    <p className="dropzone-text">Cliquez ou glissez vos fichiers ici</p>
                    <p className="dropzone-subtext">PDF, JPG, PNG (Max 15Mo)</p>
                </div>

                {files.length > 0 && (
                    <div className="file-list">
                        {files.map((file, index) => (
                            <div key={index} className="file-item" onClick={() => removeFile(file)} title="Supprimer le fichier">
                                <div className="file-info">
                                    <span className="file-icon pdf-icon">
                                        <img src={fileIcon} alt="File" width="20" height="20" />
                                    </span>
                                    <span className="file-name" onClick={(e) => downloadFile(e, file)} title="Télécharger le fichier">
                                        {file.name}
                                    </span>
                                </div>
                                <span className="upload-success deletable">
                                    <img src={checkIcon} alt="Success" className="icon-state-success" width="20" height="20" />
                                    <img src={trashIcon} alt="Delete" className="icon-state-delete" width="20" height="20" />
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
};

export default FileUpload;
