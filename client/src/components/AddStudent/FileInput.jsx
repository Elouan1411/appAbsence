import { useRef, useState } from "react";
import { FiUpload, FiCheck } from "react-icons/fi";

const FileInput = ({ file, fileName, onFileChange, onDropFile }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`file-upload-area ${isDragging ? "dragging" : ""} ${
        file ? "has-file" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        setIsDragging(false);
        onDropFile(e);
      }}
      onClick={() => fileInputRef.current.click()}
    >
      <input
        type="file"
        accept=".xlsx,.pdf"
        ref={fileInputRef}
        onChange={onFileChange}
        style={{ display: "none" }}
      />

      <div className="upload-icon">
        {file ? <FiCheck size={40} /> : <FiUpload size={40} />}
      </div>

      <div className="upload-text">
        {file ? (
          <p className="file-name">{fileName}</p>
        ) : (
          <>
            <p>Glissez-déposez votre fichier ici</p>
            <p>ou cliquez pour parcourir</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileInput;
