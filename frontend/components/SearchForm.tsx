"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

type SearchFormProps = {
  initialValue?: string;
  variant?: "header" | "hero";
  className?: string;
};

export default function SearchForm({
  initialValue = "",
  variant = "header",
  className = "",
}: SearchFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const inputId = useId();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={className}>
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search supplements"
          className={`w-full border border-input pl-10 pr-4 text-foreground outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/15 ${
            variant === "hero" ? "h-12 rounded-lg bg-card text-base shadow-card focus:shadow-raised" : "h-11 rounded-md bg-muted text-base focus:shadow-card md:h-10"
          }`}
        />
      </div>
    </form>
  );
}
