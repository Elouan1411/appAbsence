import { useState, useEffect } from "react";

export function useTheme() {
    const [theme, setTheme] = useState(sessionStorage.getItem("theme") || "light");

    useEffect(() => {
        const savedTheme = sessionStorage.getItem("theme") || "light";

        document.body.className = savedTheme;
        setTheme(savedTheme);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    setTheme(document.body.className);
                }
            });
        });

        observer.observe(document.body, { attributes: true });

        return () => observer.disconnect();
    }, []);

    return theme;
}
