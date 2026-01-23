import React from "react";
import "../../style/icon.css";
import "../../style/searchAgGrid.css";

const SearchInput = ({ value, onChange, placeholder = "Rechercher...", onIconClick, className="search-container" }) => {
    return (
        <div className={className}>
            <input type="text" value={value} onChange={onChange} placeholder={placeholder} autoFocus className="search-input" />
            <button onClick={onIconClick} className={`search-button ${onIconClick ? "clickable" : ""}`}>
                <span className="icon icon-search search-icon-sized" />
            </button>
        </div>
    );
};

export default SearchInput;
