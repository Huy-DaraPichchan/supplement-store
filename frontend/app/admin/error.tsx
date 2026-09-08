"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Admin data could not be loaded</h1>
        <p className="mt-2 text-muted-foreground">Check that the backend is available, then try again.</p>
        <button type="button" onClick={reset} className="mt-5 min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary-hover">
          Try again
        </button>
      </div>
    </main>
  );
}
