import React from "react";
import Title from "./Title";
import removeAllAccents from "../../functions/removeAllAccents";
import NavigateBackButton from "./NavigateBackButton";
import "../../style/PageTitle.css";

function PageTitle({ title, icon, canGoBack = false }) {
    const titleToClassName = removeAllAccents(title.toLowerCase().replaceAll(" ", "-")) || "";
    return (
        <div className="all-title-container">
            {canGoBack && <NavigateBackButton />}
            <div className="title-container">
                <span className={`icon-big ${icon || `icon-${titleToClassName}`}`}></span>
                <Title>{title}</Title>
            </div>
        </div>
    );
}

export default PageTitle;
