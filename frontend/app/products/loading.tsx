import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function ProductsLoading() {
  return (
    <main className="min-h-screen" aria-label="Loading products" aria-busy="true">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-7 sm:px-6 sm:py-11 lg:px-8">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-9 w-full max-w-md rounded" />
          <div className="skeleton h-5 w-full max-w-xl rounded" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-3 pb-12 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <div className="hidden rounded-xl border border-border bg-card p-5 shadow-card lg:block">
            <div className="skeleton h-5 w-28 rounded" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => <div key={index} className="skeleton h-10 rounded-md" />)}
            </div>
          </div>
          <div>
            <div className="mb-5 space-y-3 rounded-xl border border-border bg-card p-3 shadow-card sm:p-4">
              <div className="skeleton h-11 rounded-md" />
              <div className="flex justify-between gap-3">
                <div className="skeleton h-11 w-24 rounded-md" />
                <div className="skeleton h-11 w-40 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
