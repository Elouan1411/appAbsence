import React from "react";
import Title from "./Title";
import removeAllAccents from "../../functions/removeAllAccents";

function PageTitle({ title, icon }) {
    const titleToClassName = removeAllAccents(title.toLowerCase().replaceAll(" ", "-")) || "";
    return (
        <div className="title-container">
            <span className={`icon-big ${icon || `icon-${titleToClassName}`}`}></span>
            <Title>{title}</Title>
        </div>
    );
}

export default PageTitle;
