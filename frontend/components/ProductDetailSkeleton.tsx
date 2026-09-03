export default function ProductDetailSkeleton() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-3 py-6 sm:px-6 sm:py-12 lg:px-8" aria-label="Loading product" aria-busy="true">
      <div className="skeleton h-5 w-36 rounded" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="skeleton aspect-square rounded-xl shadow-card" />
        <div className="space-y-5 rounded-xl border border-border bg-card p-4 shadow-card sm:p-7">
          <div className="skeleton h-7 w-32 rounded" />
          <div className="skeleton h-12 w-4/5 rounded" />
          <div className="skeleton h-10 w-32 rounded" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
          <div className="skeleton h-11 w-full rounded-md" />
        </div>
      </div>
    </main>
  );
}
