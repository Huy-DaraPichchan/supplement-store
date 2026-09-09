"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 text-center">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-panel">
        <span className="mx-auto flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><AlertTriangle className="size-6" /></span>
        <h1 className="mt-4 font-heading text-2xl font-semibold">Admin data could not be loaded</h1>
        <p className="mt-2 text-muted-foreground">Check that the backend is available, then try again.</p>
        <Button type="button" onClick={reset} size="lg" className="mt-5">Try again</Button>
      </div>
    </main>
  );
}
