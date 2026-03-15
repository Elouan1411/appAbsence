import React, { useEffect, useState } from "react";
import "../../style/PWAInstallModal.css";
import "../../style/icon.css";

const PWAInstallModal = ({ isOpen, onClose }) => {
    const [os, setOs] = useState("unknown");

    useEffect(() => {
        if (!isOpen) return;

        const userAgent = window.navigator.platform || window.navigator.userAgent || window.navigator.vendor || window.opera;
        // iOS detection
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            setOs("ios");
        }
        // Android detection
        else if (/android/i.test(userAgent)) {
            setOs("android");
        }
        else {
            setOs("other");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="pwa-modal-overlay" onClick={onClose}>
            <div className="pwa-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="pwa-modal-close" onClick={onClose}>
                    &times;
                </button>
                <h3>Installer l'application</h3>

                {os === "ios" && (
                    <div className="pwa-tutorial-content">
                        <p>Pour installer l'application sur votre appareil iOS :</p>
                        <ol>
                            <li>Appuyez sur le bouton <strong>Partager</strong> <span className="icon icon-xl icon-share-ios"></span> (le carré avec une flèche vers le haut).</li>
                            <li>Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong>.</li>
                            <li>Appuyez sur <strong>Ajouter</strong> en haut à droite.</li>
                        </ol>
                    </div>
                )}

                {os === "android" && (
                    <div className="pwa-tutorial-content">
                        <p>Pour installer l'application sur votre appareil Android :</p>
                        <ol>
                            <li>Appuyez sur l'icône de menu <strong>Trois points</strong> (généralement en haut à droite).</li>
                            <li>Sélectionnez <strong>Ajouter à l'écran d'accueil</strong> ou <strong>Installer l'application</strong>.</li>
                            <li>Suivez les instructions à l'écran pour confirmer.</li>
                        </ol>
                    </div>
                )}

                {os === "other" && (
                    <div className="pwa-tutorial-content">
                        <p>Pour installer l'application sur votre ordinateur :</p>
                        <ol>
                            <li>Recherchez l'icône d'installation dans la barre d'adresse de votre navigateur (généralement à droite).</li>
                            <li>Cliquez dessus puis sur <strong>Installer</strong>.</li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PWAInstallModal;
