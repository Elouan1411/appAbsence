export default async function isLoginInDatabase(login) {
    const data = await fetch("http://localhost:3000/teacher/allLoginENT", {
        method: "GET",
        credentials: "include",
    });
    const logins = await data.json();

    const estPresent = logins.some((item) => item.loginENT === login);
    console.log("Est présent: ", estPresent);
    return estPresent;
}
