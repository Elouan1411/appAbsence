export default function parseTimestamp(timestamp) {
    // Format attendu : YYYYMMDDHHmm (ex: 202601091800)
    const year = parseInt(timestamp.substring(0, 4));
    const month = parseInt(timestamp.substring(4, 6)) - 1;
    const day = parseInt(timestamp.substring(6, 8));
    const hour = parseInt(timestamp.substring(8, 10));
    const minute = parseInt(timestamp.substring(10, 12));
    return new Date(year, month, day, hour, minute);
}
