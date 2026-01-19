export default function dateFormatter(dateInt) {
    if (dateInt) {
        let str = dateInt.toString();
        const year = str.slice(0, 4);
        const month = str.slice(4, 6);
        const day = str.slice(6, 8);
        const hour = str.slice(8, 10);
        const minute = str.slice(10, 12);
        return `${day}/${month}/${year} ${hour}:${minute}`;
    }
}
