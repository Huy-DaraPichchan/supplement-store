export default function AdminLoading() {
  return (
    <main className="mx-auto min-h-dvh max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="skeleton h-10 w-56 rounded-md" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(18rem,24rem)_1fr]">
        <div className="skeleton h-96 rounded-lg" />
        <div className="grid gap-4">
          <div className="skeleton h-52 rounded-lg" />
          <div className="skeleton h-52 rounded-lg" />
        </div>
      </div>
    </main>
  );
}
