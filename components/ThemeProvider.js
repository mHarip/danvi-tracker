"use client";
import {createContext, useContext, useEffect, useState} from "react";

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

export default function ThemeProvider({children}) {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const saved = localStorage.getItem("theme") || "light";
        setTheme(saved);
        document.documentElement.setAttribute("data-bs-theme", saved);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-bs-theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            <div data-theme={theme}>{children}</div>
        </ThemeContext.Provider>
    );
}