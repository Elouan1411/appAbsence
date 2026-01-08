export default function valueFormatter(params) {
    const value = params.value;
    if (value == null || value == undefined) {
        return "-";
    }

    if (Array.isArray(value)) {
        return value.length ? value.join(", ") : "-";
    }

    if (typeof value === "object") {
        const values = Object.values(value);
        return values.length ? values.join(", ") : "-";
    }
    return value;
}
