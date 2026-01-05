import { RSE_COLORS } from "../../constants/RSE_COLORS";
const RseCell = ({ value }) => {
  if (!value || typeof value !== "object") return "-";
  if (Object.keys(value).length == 0) return "-";

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {Object.entries(value).map(([id, label]) => (
        <span
          key={id}
          style={{
            backgroundColor: RSE_COLORS[id] || "#EEEEEE",
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
