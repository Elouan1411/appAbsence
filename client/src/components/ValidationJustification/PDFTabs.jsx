import React, { useEffect, useRef } from "react";
import "../../style/Student.css";
import "../../style/StudentMobile.css";

const PDFTabs = ({ activeTab, setActiveTab, tabs }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const activeElement = container?.querySelector(".dashboard-tab.active");

        if (container && activeElement) {
            activeElement.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
            });
        }
    }, [activeTab]);

    return (
        <div className="dashboard-tabs scrollable-tabs" ref={containerRef}>
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
