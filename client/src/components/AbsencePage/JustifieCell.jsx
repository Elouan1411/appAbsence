const JustifieCell = ({ data }) => {
    const validite = data.validite;

    const getStatus = () => {
        switch (validite) {
            case 0:
                return { text: "Justifiée", className: "justified-badge" };
            case 1:
                return { text: "Refusée", className: "refused-badge" };
            case 2:
                return { text: "En cours", className: "pending-badge" };
            case 3:
                return { text: "Attente modification", className: "pending-badge" };
            default:
                return { text: "Non justifiée", className: "no-justified-badge" };
        }
    };

    const status = getStatus();

    return <span className={`justification-badge ${status.className}`}>{status.text}</span>;
};

export default JustifieCell;
