import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../../style/Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="pagination-container">
            <button className="pagination-button" onClick={handlePrevious} disabled={currentPage === 1} aria-label="Previous page">
                <ChevronLeft size={20} />
            </button>
            <span className="pagination-info">
                Page {currentPage} sur {totalPages}
            </span>
            <button className="pagination-button" onClick={handleNext} disabled={currentPage === totalPages} aria-label="Next page">
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
