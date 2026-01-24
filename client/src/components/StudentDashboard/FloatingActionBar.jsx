import React from "react";
// import { ArrowRight } from "lucide-react";
import "../../style/Student.css";
import "../../style/StudentMobile.css";

const FloatingActionBar = ({ count, onJustify }) => {
    return (
        <div className="floating-action-bar">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="fab-count-circle">{count}</div>
                <span className="fab-text">absences sélectionnées</span>
            </div>
            <button className="btn-fab-justify" onClick={onJustify}>
                Tout justifier
                {/* <ArrowRight size={16} strokeWidth={2.5} /> */}
                <span className="icon icon-arrow-right" style={{ width: 16, height: 16, backgroundColor: "currentColor" }} />
            </button>
        </div>
    );
};

export default FloatingActionBar;
