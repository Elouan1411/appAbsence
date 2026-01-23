const toggleTheme = () => {
    const currentTheme = sessionStorage.getItem("theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";

    sessionStorage.setItem("theme", newTheme);
    document.body.className = newTheme;
};

export default toggleTheme;
