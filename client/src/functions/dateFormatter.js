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
