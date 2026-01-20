import { RSE_COLORS_DARK, RSE_COLORS_LIGHT } from "../../../constants/RSE_COLORS";
import { useTheme } from "../../../hooks/useTheme";
const RseCell = ({ value }) => {
    const theme = useTheme();
    if (!value || typeof value !== "object") return "-";
    if (Object.keys(value).length == 0) return "-";

    return (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(value).map(([id, label]) => (
                <span
                    key={id}
                    style={{
                        backgroundColor: theme == "dark" ? RSE_COLORS_DARK[id] || "#EEEEEE" : RSE_COLORS_LIGHT[id] || "#EEEEEE",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        lineHeight: "18px",
                        whiteSpace: "nowrap",
                    }}
                >
                    {label}
                </span>
            ))}
        </div>
    );
};

export default RseCell;
