import { useState } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../config";

export const useJustificationSubmit = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async (periods, reason, comment, files, mode = "create", existingId = null, removedFiles = [], originalDateDemande = null, studentLogin = null) => {
        setIsSubmitting(true);
        toast.dismiss();
        const createdIds = [];

        const fullReason = comment ? `${reason} | ${comment}` : reason;
        const now = new Date();
        const timestamp =
            now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, "0") +
            now.getDate().toString().padStart(2, "0") +
            now.getHours().toString().padStart(2, "0") +
            now.getMinutes().toString().padStart(2, "0") +
            now.getSeconds().toString().padStart(2, "0");

        try {
            let targetId = existingId;

            if (mode === "create") {
                let firstCreatedId = null;

                for (const p of periods) {
                    const payload = {
                        start: new Date(p.start).getTime(),
                        end: new Date(p.end).getTime(),
                        justification: fullReason,
                        timestamp: now.getTime(),
                        studentLogin: studentLogin,
                    };

                    const response = await fetch(`${API_URL}/justification`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                        credentials: "include",
                    });

                    if (!response.ok) throw new Error(await response.text());
                    const newId = await response.json();

                    if (!firstCreatedId) firstCreatedId = newId;
                    createdIds.push(newId);
                }
                targetId = firstCreatedId;
            } else if (mode === "update" && existingId) {
                let firstCreatedId = null;

                for (const p of periods) {
                    const isExistingPeriod = !p.isNew;

                    const payload = {
                        start: new Date(p.start).getTime(),
                        end: new Date(p.end).getTime(),
                        justification: fullReason,
                        timestamp: originalDateDemande || now.getTime(), // Only used for POST
                    };

                    if (isExistingPeriod) {
                        // PUT existing
                        const idToUpdate = String(p.id).replace(/^J-|^A-/, "") || existingId;
                        const response = await fetch(`${API_URL}/justification/${idToUpdate}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                            credentials: "include",
                        });
                        if (!response.ok) throw new Error(await response.text());
                    } else {
                        // POST new
                        const response = await fetch(`${API_URL}/justification`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                            credentials: "include",
                        });

                        if (!response.ok) throw new Error(await response.text());
                        const newId = await response.json();
                        if (!firstCreatedId) firstCreatedId = newId;
                    }
                }
                targetId = existingId;
            }

            // File Uploads
            // Only upload files that are not marked as existing
            if (files.length > 0 && targetId) {
                const cleanId = String(targetId).replace(/^J-|^A-/, "");

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.isExisting) continue;

                    const fileData = new FormData();
                    const customName = `${cleanId}-doc${i + 1}-${timestamp}`;

                    fileData.append("file", file);
                    fileData.append("fileName", customName);

                    const fileResponse = await fetch(`${API_URL}/file/upload`, {
                        method: "POST",
                        body: fileData,
                        credentials: "include",
                    });

                    if (!fileResponse.ok) console.error("File upload failed", file.name);
                }
            }

            // File Deletion
            if (removedFiles.length > 0) {
                for (const file of removedFiles) {
                    // Use originalName if available (for renamed files), otherwise name
                    const filename = file.originalName || file.name;

                    const response = await fetch(`${API_URL}/file/${filename}`, {
                        method: "DELETE",
                        credentials: "include",
                    });

                    if (!response.ok) console.error("Failed to delete file", filename);
                }
            }

            toast.success(mode === "create" ? "Justification envoyée !" : "Justification mise à jour !");
            return { success: true, ids: createdIds, targetId };
        } catch (error) {
            const cleanMessage = error.message.replace(/^"|"$/g, ""); // clean json string
            toast.error(cleanMessage || "Une erreur est survenue lors de l'envoi.");
            return { success: false };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { submit, isSubmitting };
};
