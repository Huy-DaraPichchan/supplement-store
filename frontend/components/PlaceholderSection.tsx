import type { LucideIcon } from "lucide-react";

export default function PlaceholderSection({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-3xl items-center justify-center">
      <div className="w-full rounded-lg border border-dashed border-border p-10 text-center sm:p-16">
        <span className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary-soft text-primary"><Icon className="size-6" /></span>
        <h2 className="mt-4 font-heading text-2xl font-semibold">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
        <span className="mt-5 inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">Coming soon</span>
      </div>
    </section>
  );
}
