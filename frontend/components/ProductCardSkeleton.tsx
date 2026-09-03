export default function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card" aria-hidden="true">
      <div className="skeleton aspect-square border-b border-border" />
      <div className="space-y-3 p-3 sm:p-4">
        <div className="skeleton h-5 w-4/5 rounded" />
        <div className="skeleton h-3 w-2/5 rounded" />
        <div className="flex items-end justify-between gap-3 pt-2">
          <div className="skeleton h-6 w-20 rounded" />
          <div className="skeleton size-11 rounded-md" />
        </div>
      </div>
    </div>
  );
}
