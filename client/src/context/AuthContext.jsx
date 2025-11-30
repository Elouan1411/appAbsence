import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/auth/", {
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
    const res = await fetch("http://localhost:3000/auth/login", {
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
  };

  const logout = async () => {
    await fetch("http://localhost:3000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setRole(null);
  };

  const value = { user, role, loading, login, logout };

  return <AuthContext value={value}>{children}</AuthContext>;
}
