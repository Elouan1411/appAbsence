import React from "react";
import "../../style/Student.css";
import "../../style/StudentMobile.css";

const DashboardTabs = ({ activeTab, setActiveTab, counts = { todo: 0, pending: 0, archived: 0 } }) => {
    const tabs = [
        { id: "todo", label: "À faire", count: counts.todo },
        { id: "pending", label: "En cours", count: counts.pending },
        { id: "archived", label: "Archives", count: counts.archived },
    ];

    return (
        <div className="dashboard-tabs">
            {tabs.map((tab) => (
                <button key={tab.id} className={`dashboard-tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                    <span className="tab-dot"></span>
                    {tab.label}
                    {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
                </button>
            ))}
        </div>
    );
};

export default DashboardTabs;
