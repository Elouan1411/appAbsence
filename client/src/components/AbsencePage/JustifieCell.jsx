const JustifieCell = ({ value }) => {
    const label = value == 1 ? "Justifiée" : "Non-justifiée";

    return <span className={value == 1 ? "justification-badge justified-badge" : "justification-badge no-justified-badge"}>{label}</span>;
};

export default JustifieCell;
