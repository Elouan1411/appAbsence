export default function getIconClass(title) {
    return `icon-${title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")}`;
}
