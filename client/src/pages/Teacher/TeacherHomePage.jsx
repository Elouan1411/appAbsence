import React, { useState, useEffect } from "react";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import RecentCard from "../../components/Teacher/RecentCard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import "../../style/Teacher.css";

function TeacherHomePage() {
    const { logout, user } = useAuth();
    const [recentCourses, setRecentCourses] = useState([]);
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await logout();
        try {
        } catch (error) {}
    };

    useEffect(() => {
        async function fetchRecent() {
            if (!user) return;
            try {
                const response = await fetch(`http://localhost:3000/appel/recent/:${user}`, { credentials: "include" });
                if (response.ok) {
                    const data = await response.json();
                    setRecentCourses(data);
                }
            } catch (err) {
                console.error("Erreur fetch recent:", err);
            }
        }
        fetchRecent();
    }, [user]);

    const handleCardClick = (course) => {
        navigate("/teacher/rollcall", { state: { shortcut: course } });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        if (String(dateStr).length >= 12) {
             const year = parseInt(String(dateStr).substring(0, 4), 10);
            const month = parseInt(String(dateStr).substring(4, 6), 10) - 1;
            const day = parseInt(String(dateStr).substring(6, 8), 10);
            return format(new Date(year, month, day), "d MMMM yyyy", { locale: fr });
        }
        return dateStr;
    };

    return (
        <div className="page-container">
            <PageTitle title="Page d'accueil enseignant" icon="icon-home" />

            <div className="recent-section">
                <h3 className="recent-title">Reprendre un cours récent</h3>
                <div className="recent-grid">
                    {recentCourses.map((course, index) => (
                        <RecentCard
                            key={index}
                            promo={course.promo}
                            group={
                                (course.groupeTD ? course.groupeTD : "") +
                                (course.groupeTD && course.groupeTP ? " - " : "") +
                                (course.groupeTP ? course.groupeTP : "") +
                                (course.groupeTD || course.groupeTP ? "" : "-")
                            }
                            subject={course.libelle}
                            date={"Dernier cours : " + formatDate(course.last_date)}
                            onClick={() => handleCardClick(course)}
                        />
                    ))}
                    {recentCourses.length === 0 && <p className="empty-message">Aucun cours récent trouvé.</p>}
                </div>
            </div>
        </div>
    );
}

export default TeacherHomePage;
