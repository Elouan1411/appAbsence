import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import ReasonInput from "../../components/AbsenceForm/ReasonInput";
import FileUpload from "../../components/AbsenceForm/FileUpload";
import Button from "../../components/common/Button";
import PeriodAbsence from "../../components/AbsenceForm/PeriodAbsence";

const StudentAbsenceDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");
    const [files, setFiles] = useState([]);
    const [period, setPeriod] = useState([]);

    const isEditable = true;

    useEffect(() => {
        const loadFiles = async (justifId) => {
            try {
                // get info about the justification
                const response = await fetch(`http://localhost:3000/justification/${justifId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                if (data.list && Array.isArray(data.list) && data.list.length > 0) {
                    const filePromises = data.list.map(async (filename) => {
                        try {
                            // get the file
                            const fileRes = await fetch(`http://localhost:3000/upload/justification/${filename}`);
                            if (!fileRes.ok) {
                                return null;
                            }

                            const blob = await fileRes.blob();
                            // create file object
                            return new File([blob], filename, { type: blob.type });
                        } catch (e) {
                            console.error("Error fetching file", filename, e);
                            return null;
                        }
                    });

                    const loadedFiles = (await Promise.all(filePromises)).filter((f) => f !== null);
                    setFiles(loadedFiles);
                }
            } catch (error) {
                console.error("Error loading justification files:", error);
            }
        };

        if (location.state) {
            if (location.state.prefilledPeriod) {
                // Ensure IDs are unique if multiple periods
                const periods = location.state.prefilledPeriod.map((p, idx) => ({
                    ...p,
                    start: new Date(p.start),
                    end: new Date(p.end),
                    id: p.id || Date.now() + idx,
                }));
                setPeriod(periods);
            }

            if (location.state.reason) {
                const fullReason = location.state.reason;
                // Parse motif "Reason | Comment"
                const [parsedReason, parsedComment] = (fullReason || "").split(" | ");
                setReason(parsedReason || "autre");
                setComment(parsedComment || parsedReason || "");
            }

            if (location.state.justificationId) {
                loadFiles(location.state.justificationId);
            }
        }
    }, [location.state]);

    return (
        <div className="student-justification-container">
            <div className="studentJustificationPage">
                <PageTitle title="Détails de l'absence" icon="icon-justification-student" />

                <PeriodAbsence period={period} setPeriod={setPeriod} errors={{}} error={false} automaticPeriod={true} />

                <hr className="section-divider" />

                <ReasonInput reason={reason} comment={comment} onReasonChange={setReason} onCommentChange={setComment} error={false} />

                <hr className="section-divider" />

                <FileUpload files={files} setFiles={setFiles} />
            </div>
        </div>
    );
};

export default StudentAbsenceDetailsPage;
