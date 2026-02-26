import React, { useState, useRef } from "react";
import "../../style/Student.css";
import "../../style/StudentMobile.css";
import cloudIcon from "../../assets/upload_cloud.svg";
import fileIcon from "../../assets/file_document.svg";
import checkIcon from "../../assets/check_success.svg";
import trashIcon from "../../assets/trash.svg";
import toast from "react-hot-toast";
import { alertConfirm } from "../../hooks/alertConfirm";

const FileUpload = ({ files, setFiles }) => {
    // Helper to check extensions
    const ALLOWED_EXTENSIONS = {
        images: ["jpg", "jpeg", "png"],
        docs: ["pdf"],
    };

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
        e.target.value = null;
    };

    const truncateFileName = (name, maxLength = 20) => {
        // for toast
        if (name.length <= maxLength) return name;
        const extension = name.split(".").pop();
        const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
        const half = Math.floor((maxLength - 3 - extension.length - 1) / 2);
        return `${nameWithoutExt.substring(0, half)}...${nameWithoutExt.slice(-half)}.${extension}`;
    };

    const addFiles = async (newFiles) => {
        const MAX_NB_FILES = 10;
        if (files.length + newFiles.length > MAX_NB_FILES) {
            toast.error(`Vous ne pouvez pas ajouter plus de ${MAX_NB_FILES} fichiers.`);
            return;
        }
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB

        const processedFiles = [];

        for (let i = 0; i < newFiles.length; i++) {
            let file = newFiles[i];

            if (file.size > MAX_SIZE) {
                toast.error(`Le fichier ${truncateFileName(file.name)} dépasse la limite de 5Mo.`);
                continue;
            }

            const extension = file.name.split(".").pop().toLowerCase();
            const isAllowedImage = ALLOWED_EXTENSIONS.images.includes(extension);
            const isAllowedDoc = ALLOWED_EXTENSIONS.docs.includes(extension);

            if (!isAllowedImage && !isAllowedDoc) {
                toast.error(`L'extension du fichier ${truncateFileName(file.name)} n'est pas supportée.`);
                continue;
            }

            toast.success(`Le fichier ${truncateFileName(file.name)} a été ajouté.`);
            processedFiles.push(file);
        }

        if (processedFiles.length > 0) {
            setFiles((prev) => {
                const combined = [...prev, ...processedFiles];
                return combined.slice(0, MAX_NB_FILES);
            });
        }
    };

    const removeFile = async (fileToRemove) => {
        const confirm = await alertConfirm("Suppression du fichier", "Voulez-vous vraiment supprimer ce fichier ?");
        if (!confirm.isConfirmed) return;

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

    const formatFileSize = (bytes) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <div className="file-upload-container">
            <h3 className="section-title-student">
                Justificatifs <span className="optional-text">(Optionnel)</span>
            </h3>

            <div
                className={`dropzone ${isDragging ? "dragging" : ""}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} multiple accept="image/jpeg, image/png" />

                <div className="cloud-icon-container">
                    <img src={cloudIcon} alt="Upload" width="24" height="24" />
                </div>

                <p className="dropzone-text">Cliquez ou glissez vos fichiers ici</p>
                <p className="dropzone-subtext">PDF, JPG, JPEG, PNG (Max 5Mo)</p>
            </div>

            {files.length > 0 && (
                <div className="file-list">
                    {files.map((file, index) => (
                        <div key={index} className="file-item file-item-readonly" onClick={() => removeFile(file)}>
                            <div className="file-info">
                                <span className="file-icon pdf-icon">
                                    <img src={fileIcon} alt="File" width="20" height="20" />
                                </span>
                                <div className="file-details">
                                    <span className="file-name" onClick={(e) => downloadFile(e, file)} title="Télécharger le fichier">
                                        {file.name}
                                    </span>
                                    <span className="file-size">{formatFileSize(file.size)}</span>
                                </div>
                            </div>
                            <div className="file-actions">
                                <button className="action-icon-btn download-btn" onClick={(e) => downloadFile(e, file)} title="Télécharger">
                                    <span className="icon icon-download" />
                                </button>
                                <span
                                    className="upload-success deletable"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(file);
                                    }}
                                    title="Supprimer"
                                >
                                    <img src={checkIcon} alt="Success" className="icon-state-success" width="20" height="20" />
                                    <img src={trashIcon} alt="Delete" className="icon-state-delete" width="20" height="20" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
