"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Reads/writes the "dark" class on <html>. No external theme library —
// just localStorage + a class toggle, so it's easy to follow and reuse.
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // On first load, use the saved preference, or fall back to the
  // user's OS setting if they haven't chosen one yet.
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = saved ? saved === "dark" : prefersDark;

    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-brand-50 hover:text-brand dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}