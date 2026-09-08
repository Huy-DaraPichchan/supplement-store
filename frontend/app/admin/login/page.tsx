import AdminLoginForm from "@/components/AdminLoginForm";
import Image from "next/image";
import Link from "next/link";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-panel sm:p-8">
        <Link href="/" className="inline-flex rounded-md">
          <Image src="/vista-care-logo.svg" width={132} height={62} alt="Vista Care" className="h-11 w-auto" />
        </Link>
        <p className="mt-7 text-sm font-medium text-primary">Store administration</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Sign in with an existing administrator account.</p>
        {expired && (
          <p className="mt-4 rounded-md bg-warm-accent-soft px-3 py-2 text-sm text-warning">
            Your session expired. Please sign in again.
          </p>
        )}
        <AdminLoginForm />
        <Link href="/" className="mt-6 inline-flex text-sm font-medium text-primary hover:underline">
          Return to storefront
        </Link>
      </div>
    </main>
  );
}
