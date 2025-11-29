import { FiInfo } from "react-icons/fi";

const InstructionsCard = () => (
  <div className="info-card">
    <div className="card-header">
      <h2>
        <FiInfo /> Instructions
      </h2>
    </div>

    <div className="info-content">
      <p>Téléchargez un fichier contenant les informations des étudiants :</p>
      <ul>
        <li>
          <strong>Fichier Excel (.xlsx)</strong> : Ajout multiple.
        </li>
        <li>
          <strong>Fichier PDF (.pdf)</strong> : Documentation ou listes.
        </li>
      </ul>
    </div>
  </div>
);

export default InstructionsCard;
