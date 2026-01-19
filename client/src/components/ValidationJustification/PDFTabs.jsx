import React from "react";
import "../../style/Student.css";

const PDFTabs = ({ activeTab, setActiveTab, tabs }) => {
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
export default PDFTabs;
