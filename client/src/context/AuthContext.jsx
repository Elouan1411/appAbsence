import { createContext, useState, useEffect } from "react";
import { API_URL } from "../config";

export const AuthContext = createContext({
    user: null,
    role: null,
    loading: true,
    login: async () => {},
    logout: async () => {},
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/auth/`, {
            credentials: "include",
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.user) {
                    setUser(data.user.login);
                    setRole(data.user.role);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const login = async (user, pwd) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ user, pwd }),
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            const data = await res.json();
            setUser(user);
            setRole(data);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
        setRole(null);
    };

    const value = { user, role, loading, login, logout };

    return <AuthContext value={value}>{children}</AuthContext>;
}
