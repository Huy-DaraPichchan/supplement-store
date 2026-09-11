import type { Order } from "@/lib/types/order";
import { ArrowLeft, Package, Send } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

const getOrder = cache(async (token: string): Promise<Order | null> => {
  const baseUrl = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(token)}`, {
    cache: "no-store",
  });

  if (response.status === 404 || response.status === 422) return null;
  if (!response.ok) throw new Error(`Unable to load order: ${response.status}`);
  return response.json() as Promise<Order>;
});

type ContactSettings = {
  telegram_username: string | null;
  telegram_enabled: boolean;
};

const getContactSettings = cache(async (): Promise<ContactSettings | null> => {
  const baseUrl = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
  try {
    const response = await fetch(`${baseUrl}/settings`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json() as Promise<ContactSettings>;
  } catch {
    return null;
  }
});

function formatMoney(order: Order, usdCents: number, khr: number) {
  if (order.display_currency === "KHR") return `៛${khr.toLocaleString()}`;
  return `$${(usdCents / 100).toFixed(2)}`;
}

function formatOrderTotal(order: Order) {
  const usd = `$${(order.total_usd_cents / 100).toFixed(2)}`;
  const khr = `៛${order.total_khr.toLocaleString()}`;
  return order.display_currency === "KHR"
    ? { primary: khr, secondary: usd }
    : { primary: usd, secondary: khr };
}

function formatOrderTotalText(order: Order) {
  const total = formatOrderTotal(order);
  return `${total.primary} (${total.secondary})`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Phnom_Penh",
  }).format(new Date(value));
}

function statusClass(status: Order["status"]) {
  if (status === "cancelled") return "bg-destructive/10 text-destructive";
  if (status === "completed") return "bg-success/15 text-success";
  if (status === "confirmed") return "bg-primary-soft text-primary";
  return "bg-warm-accent-soft text-warning";
}

type OrderPageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const order = await getOrder((await params).token);
  if (!order) return { title: "Order not found", robots: { index: false, follow: false } };

  const description = `${order.items.map((item) => `${item.product_name} × ${item.quantity}`).join(", ")} · ${formatOrderTotalText(order)}`;
  const firstImage = order.items.find((item) => item.image_url)?.image_url;

  return {
    title: order.order_number,
    description,
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      type: "website",
      title: `${order.order_number} · Vista Care`,
      description,
      images: firstImage ? [{ url: firstImage, alt: `${order.order_number} product` }] : undefined,
    },
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { token } = await params;
  const [order, contactSettings] = await Promise.all([
    getOrder(token),
    getContactSettings(),
  ]);
  if (!order) notFound();

  const telegramUsername = contactSettings?.telegram_username?.replace(/^@/, "").trim();
  const telegramUrl = contactSettings?.telegram_enabled && telegramUsername
    ? `https://t.me/${encodeURIComponent(telegramUsername)}?text=${encodeURIComponent(`Hi, I have a question about order ${order.order_number}.`)}`
    : null;
  const total = formatOrderTotal(order);

  return (
    <main className="mx-auto min-h-[70dvh] max-w-6xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      <Link href="/products" className="inline-flex min-h-11 items-center gap-2 text-base text-muted-foreground transition-colors hover:text-primary">
        <ArrowLeft className="size-4" /> Back to store
      </Link>

      <header className="mt-3 border-b border-border pb-6">
        <p className="text-sm font-medium text-primary">Order details</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold sm:text-4xl">{order.order_number}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Created {formatDate(order.created_at)}</p>
      </header>

      <div className="grid items-start gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
        <section aria-labelledby="order-items">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="order-items" className="font-heading text-2xl font-semibold">Items</h2>
            <p className="text-sm text-muted-foreground">{order.items.length} {order.items.length === 1 ? "product" : "products"}</p>
          </div>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-card">
            {order.items.map((item, index) => (
              <li key={`${item.product_id || item.product_sku}-${index}`} className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                <div className="relative size-18 shrink-0 overflow-hidden rounded-md border border-border bg-muted sm:size-20">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.product_name} fill sizes="80px" className="object-contain p-2" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground"><Package className="size-6" /></span>
                  )}
                </div>
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-5">
                  <div className="min-w-0">
                    <h3 className="font-medium sm:text-base">{item.product_name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">SKU {item.product_sku}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.quantity} × {formatMoney(order, item.unit_price_usd_cents, item.unit_price_khr)}
                    </p>
                  </div>
                  <p className="mt-2 shrink-0 font-semibold sm:mt-0 sm:text-base">{formatMoney(order, item.line_total_usd_cents, item.line_total_khr)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside aria-label="Order summary" className="rounded-lg border border-border bg-card p-5 shadow-panel lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-xl font-semibold">Summary</h2>
            <span className={`rounded-md px-2.5 py-1 text-sm font-semibold capitalize ${statusClass(order.status)}`}>
              {order.status}
            </span>
          </div>

          <dl className="mt-5 grid gap-3 border-y border-border py-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Items</dt>
              <dd>{order.items.reduce((total, item) => total + item.quantity, 0)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Currency</dt>
              <dd>{order.display_currency}</dd>
            </div>
          </dl>

          <div className="flex items-end justify-between gap-4 py-5">
            <span className="font-medium">Total</span>
            <span className="inline-flex flex-wrap items-baseline justify-end gap-x-2 text-right">
              <strong className="text-2xl">{total.primary}</strong>
              <span className="text-sm font-medium text-muted-foreground">
                / {total.secondary}
              </span>
            </span>
          </div>

          {telegramUrl && (
            <a
              href={telegramUrl}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-base font-semibold text-primary-foreground shadow-card transition-[background-color,box-shadow] hover:bg-primary-hover hover:shadow-raised"
            >
              <Send className="size-4" /> Contact seller
            </a>
          )}

          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            This order can be viewed by anyone who has its private link.
          </p>
        </aside>
      </div>
    </main>
  );
}
