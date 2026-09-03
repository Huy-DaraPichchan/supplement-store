"use client";

import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const className =
    "flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:size-10 [&_svg]:size-5";

  const theme = resolvedTheme === "dark" ? "dark" : "light";
  return (
    <AnimatedThemeToggler
      theme={theme}
      onThemeChange={setTheme}
      duration={400}
      className={className}
    />
  );
}
