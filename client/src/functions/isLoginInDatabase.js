import { API_URL } from "../config";

export default async function isLoginInDatabase(login) {
    try {
        const data = await fetch(`${API_URL}/teacher/allLoginENT`, {
            method: "GET",
            credentials: "include",
        });

        if (!data.ok) {
            console.error("Error checking login in database:", data.status);
            return false;
        }

        const logins = await data.json();
        const estPresent = logins.some((item) => item.loginENT === login);
        console.log("Est présent: ", estPresent);
        return estPresent;
    } catch (error) {
        console.error("Network error checking login:", error);
        return false;
    }
}
