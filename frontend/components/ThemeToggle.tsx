"use client";

import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Moon } from "lucide-react";
import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

export default function ThemeToggle() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const { resolvedTheme, setTheme } = useTheme();

  const className =
    "flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:size-10 [&_svg]:size-5";

  const theme = resolvedTheme === "dark" ? "dark" : "light";

  if (!mounted) {
    return (
      <span className={className} aria-hidden="true">
        <Moon />
      </span>
    );
  }

  return (
    <AnimatedThemeToggler
      theme={theme}
      onThemeChange={setTheme}
      duration={400}
      className={className}
    />
  );
}
