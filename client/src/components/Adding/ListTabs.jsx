import React from "react";
import "../../style/Student.css";
import "../../style/StudentMobile.css";
import "../../style/Admin.css";

const ListTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: "student", label: "Étudiants" },
        { id: "teacher", label: "Enseignants" },
        { id: "absence", label: "Absences" },
    ];

    return (
        <div className="dashboard-tabs">
            {tabs.map((tab) => (
                <button key={tab.id} className={`dashboard-tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                    <span className="tab-dot"></span>
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default ListTabs;
