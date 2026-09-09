export default function AdminLoading() {
  return (
    <main className="flex min-h-dvh bg-background" aria-label="Loading admin dashboard">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-4 md:block">
        <div className="skeleton h-12 rounded-md" />
        <div className="mt-8 grid gap-3">
          {Array.from({ length: 5 }).map((_, index) => <div key={index} className="skeleton h-9 rounded-md" />)}
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center border-b border-border px-4 sm:px-6"><div className="skeleton h-8 w-36 rounded-md" /></header>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="skeleton h-9 w-56 rounded-md" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => <div key={index} className="skeleton h-40 rounded-lg" />)}
          </div>
          <div className="skeleton mt-6 h-80 rounded-lg" />
        </div>
      </div>
    </main>
  );
}
