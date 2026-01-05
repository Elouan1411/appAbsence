import { useState, useEffect } from "react";

export function useTheme() {
    const [theme, setTheme] = useState(sessionStorage.getItem("theme"));

    useEffect(() => {
        // Initial check
        setTheme(sessionStorage.getItem("theme"));

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    setTheme(sessionStorage.getItem("theme"));
                }
            });
        });

        observer.observe(document.body, { attributes: true });

        return () => observer.disconnect();
    }, []);

    return theme;
}
