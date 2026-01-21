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

export function DateObjectToInt(input) {
    const cleanDate = input.date.replaceAll("-", "");

    const cleanStartTime = input.startTime.replaceAll(":", "");
    const cleanEndTime = input.endTime.replaceAll(":", "");

    const debut = cleanDate + cleanStartTime;
    const fin = cleanDate + cleanEndTime;

    return { debut, fin };
}

export function IntToDateObject(debut, fin) {
    let finalDate = { date: "", startTime: "", endTime: "" };
    let str = debut.toString();
    const year = str.slice(0, 4);
    const month = str.slice(4, 6);
    const day = str.slice(6, 8);
    finalDate.date = `${year}-${month}-${day}`;

    const hour = str.slice(8, 10);
    const minute = str.slice(10, 12);
    finalDate.startTime = `${hour}:${minute}`;

    let str2 = fin.toString();
    const endHour = str2.slice(8, 10);
    const endMinutes = str2.slice(10, 12);
    finalDate.endTime = `${endHour}:${endMinutes}`;

    return finalDate;
}

export function semesterParity(date) {
    let str = date.toString();
    let month = str.slice(4, 6);
    if (month >= 9) {
        return 1;
    } else {
        return 0;
    }
}

export function parseDateValue(value) {
    if (!value) return null;
    const valueStr = String(value);

    // Format YYYYMMDDHHmm (12 chars)
    if (valueStr.length >= 12 && !valueStr.includes("-") && !valueStr.includes(":")) {
        const year = parseInt(valueStr.substring(0, 4), 10);
        const month = parseInt(valueStr.substring(4, 6), 10) - 1;
        const day = parseInt(valueStr.substring(6, 8), 10);
        const hour = parseInt(valueStr.substring(8, 10), 10);
        const min = parseInt(valueStr.substring(10, 12), 10);
        const date = new Date(year, month, day, hour, min);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    // Try standard Date constructor (handles ISO strings, etc.)
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
        return date;
    }
    
    return null;
}
