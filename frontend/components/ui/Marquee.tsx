import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
  speed = 40,
  gap = "1.5rem", // NEW
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  speed?: number;
  gap?: string; // NEW
}) {
  return (
    <div
      className={cn("group flex overflow-hidden gap-[--gap]", className)}
      style={{ "--gap": gap } as React.CSSProperties}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 items-stretch justify-around gap-[--gap]",
            reverse ? "animate-marquee-reverse" : "animate-marquee",
            pauseOnHover && "group-hover:paused",
          )}
          style={{ animationDuration: `${speed}s` }}
          aria-hidden={i === 1}
        >
          {children}
        </div>
      ))}
    </div>
  );
}