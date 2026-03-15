import React, { useEffect, useState } from "react";
import { isIOS, isAndroid, isMobile, isDesktop } from 'react-device-detect';
import "../../style/PWAInstallModal.css";
import "../../style/icon.css";

const PWAInstallModal = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (!isOpen) return;
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="pwa-modal-overlay" onClick={onClose}>
            <div className="pwa-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="pwa-modal-close" onClick={onClose}>
                    &times;
                </button>
                <h3>Installer l'application</h3>

                {isIOS && (  
                    <div className="pwa-tutorial-content">
                        <p>Pour installer l'application sur votre appareil iOS :</p>
                        <ol>
                            <li>Appuyez sur le bouton <strong>Partager</strong> <span className="icon icon-xl icon-share-ios"></span> (le carré avec une flèche vers le haut).</li>
                            <li>Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong>.</li>
                            <li>Appuyez sur <strong>Ajouter</strong> en haut à droite.</li>
                        </ol>
                    </div>
                )}

                {isAndroid && (
                    <div className="pwa-tutorial-content">
                        <p>Pour installer l'application sur votre appareil Android :</p>
                        <ol>
                            <li>Appuyez sur l'icône de menu <strong>Trois points</strong> (généralement en haut à droite).</li>
                            <li>Sélectionnez <strong>Ajouter à l'écran d'accueil</strong> ou <strong>Installer l'application</strong>.</li>
                            <li>Suivez les instructions à l'écran pour confirmer.</li>
                        </ol>
                    </div>
                )}

                {isDesktop && (
                    <div className="pwa-tutorial-content">
                        <p>Pour installer l'application sur votre ordinateur :</p>
                        <ol>
                            <li>Recherchez l'icône d'installation dans la barre d'adresse de votre navigateur (généralement à droite).</li>
                            <li>Cliquez dessus puis sur <strong>Installer</strong>.</li>
                        </ol>
                    </div>
                )}

                {!isIOS && !isAndroid && !isDesktop && (
                    <div className="pwa-tutorial-content">
                        <p>La méthode d'installation sur votre système n'est pas connue.</p>
                        <p>Vous pouvez essayer de l'installer en suivant les instructions générales pour les PWA.</p>
                        <p>Ou en suivant ce lien : <a href="https://web.dev/learn/pwa/installation?hl=fr">https://web.dev/learn/pwa/installation?hl=fr</a></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PWAInstallModal;
