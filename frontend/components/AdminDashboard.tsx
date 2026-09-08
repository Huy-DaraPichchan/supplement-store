"use client";

import {
  logoutAction,
  updateOrderingSettingsAction,
  updateOrderStatusAction,
} from "@/app/admin/actions";
import type { AdminSettings } from "@/lib/admin";
import type { Order, OrderStatus } from "@/lib/types/order";
import { ChevronDown, ExternalLink, LogOut, MessageCircle, Package, PackageCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";

const statuses: Array<"all" | OrderStatus> = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function formatMoney(order: Order, usdCents: number, khr: number) {
  if (order.display_currency === "KHR") {
    return `៛${khr.toLocaleString()}`;
  }
  return `$${(usdCents / 100).toFixed(2)}`;
}

function formatOrderTotal(order: Order) {
  const usd = `$${(order.total_usd_cents / 100).toFixed(2)}`;
  const khr = `៛${order.total_khr.toLocaleString()}`;
  return order.display_currency === "KHR"
    ? { primary: khr, secondary: usd }
    : { primary: usd, secondary: khr };
}

function OrderTotal({ order, compact = false }: { order: Order; compact?: boolean }) {
  const total = formatOrderTotal(order);
  return (
    <span className="inline-flex flex-wrap items-baseline justify-end gap-x-1.5">
      <span className={compact ? "font-semibold" : "text-xl font-bold"}>{total.primary}</span>
      <span className={`${compact ? "text-xs" : "text-sm"} font-normal text-muted-foreground`}>
        / {total.secondary}
      </span>
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Phnom_Penh",
  }).format(new Date(value));
}

function statusClass(status: OrderStatus) {
  if (status === "cancelled") return "bg-destructive/10 text-destructive";
  if (status === "completed") return "bg-success/15 text-success";
  if (status === "confirmed") return "bg-primary-soft text-primary";
  return "bg-warm-accent-soft text-warning";
}

function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function changeStatus(status: OrderStatus) {
    if (status === "cancelled" && !window.confirm(`Cancel ${order.order_number}?`)) return;
    setMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      setMessage({ type: result.status === "success" ? "success" : "error", text: result.message || "" });
      if (result.status === "success") router.refresh();
    });
  }

  return (
    <details className="group overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <summary className="flex min-h-20 list-none cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 marker:hidden sm:px-5">
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-180" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{order.order_number}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(order.created_at)} · {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium capitalize sm:text-sm ${statusClass(order.status)}`}>
            {order.status}
          </span>
          <p className="mt-1"><OrderTotal order={order} compact /></p>
        </div>
      </summary>

      <div className="border-t border-border px-4 py-5 sm:px-5">
        <dl className="grid gap-3 rounded-md bg-muted p-4 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Contact channel</dt><dd className="mt-0.5 font-medium capitalize">{order.selected_channels.replaceAll(",", ", ")}</dd></div>
          <div><dt className="text-muted-foreground">Display currency</dt><dd className="mt-0.5 font-medium">{order.display_currency}</dd></div>
          <div><dt className="text-muted-foreground">Created</dt><dd className="mt-0.5 font-medium">{formatDate(order.created_at)}</dd></div>
          <div><dt className="text-muted-foreground">Exchange rate</dt><dd className="mt-0.5 font-medium">{`៛${Number(order.exchange_rate).toLocaleString()} per USD`}</dd></div>
        </dl>

        <h4 className="mt-5 font-medium">Products</h4>
        <ul className="mt-2 divide-y divide-border border-y border-border">
          {order.items.map((item, index) => (
            <li key={`${item.product_id || item.product_sku}-${index}`} className="flex gap-3 py-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted sm:size-20">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.product_name} fill sizes="80px" className="object-contain p-2" />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted-foreground"><Package className="size-6" /></span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.product_name}</p>
                <p className="mt-1 text-sm text-muted-foreground">SKU {item.product_sku}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.quantity} × {formatMoney(order, item.unit_price_usd_cents, item.unit_price_khr)}
                </p>
              </div>
              <p className="shrink-0 font-semibold">{formatMoney(order, item.line_total_usd_cents, item.line_total_khr)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between gap-4 text-lg">
          <span>Total</span>
          <OrderTotal order={order} />
        </div>

        {nextStatuses[order.status].length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
            {nextStatuses[order.status].map((status) => (
              <button
                key={status}
                type="button"
                disabled={pending}
                onClick={() => changeStatus(status)}
                className={`min-h-11 rounded-md px-4 text-sm font-semibold capitalize transition-colors disabled:opacity-50 ${
                  status === "cancelled"
                    ? "border border-destructive/40 text-destructive hover:bg-destructive/10"
                    : "bg-primary text-primary-foreground hover:bg-primary-hover"
                }`}
              >
                {pending ? "Updating…" : status}
              </button>
            ))}
          </div>
        )}

        {message && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={`mt-3 rounded-md px-3 py-2 text-sm ${
              message.type === "error" ? "bg-destructive/10 text-destructive" : "bg-success/15 text-success"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </details>
  );
}

export default function AdminDashboard({
  settings,
  orders,
  selectedStatus,
}: {
  settings: AdminSettings;
  orders: Order[];
  selectedStatus: "all" | OrderStatus;
}) {
  const router = useRouter();
  const [settingsState, settingsAction, settingsPending] = useActionState(
    updateOrderingSettingsAction,
    { status: "idle" as const },
  );
  const telegramUsername = settings.telegram_username?.replace(/^@/, "") || "";

  return (
    <main className="min-h-dvh">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin"
              aria-label="Vista Care admin dashboard"
              className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Image
                src="/vista-care-logo.svg"
                width={118}
                height={56}
                alt="Vista Care"
                className="h-9 w-auto sm:h-10"
              />
            </Link>
            <div className="min-w-0 border-l border-border pl-3">
              <p className="font-heading text-base font-semibold leading-tight sm:text-lg">Admin panel</p>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">Ordering and fulfillment</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted">
              <LogOut className="size-4" /> Logout
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(18rem,24rem)_1fr] lg:px-8">
        <section aria-labelledby="ordering-settings">
          <div className="lg:sticky lg:top-8">
            <div className="flex items-center gap-3">
              <MessageCircle className="size-5 text-primary" />
              <div>
                <h1 id="ordering-settings" className="font-heading text-2xl font-semibold">Ordering settings</h1>
                <p className="text-sm text-muted-foreground">Configure the customer handoff.</p>
              </div>
            </div>

            <form action={settingsAction} className="mt-5 grid gap-5 rounded-lg border border-border bg-card p-5 shadow-card">
              <div className="grid gap-2">
                <label htmlFor="telegram_username" className="text-sm font-medium">Telegram username</label>
                <div className="flex h-11 overflow-hidden rounded-md border border-input bg-background">
                  <span className="flex items-center border-r border-border px-3 text-muted-foreground">@</span>
                  <input
                    id="telegram_username"
                    name="telegram_username"
                    defaultValue={telegramUsername}
                    placeholder="seller_username"
                    autoComplete="off"
                    className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter the username only, not a Telegram link.</p>
              </div>

              <label className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border px-3">
                <span>
                  <span className="block text-sm font-medium">Enable Telegram ordering</span>
                  <span className="block text-xs text-muted-foreground">Makes Telegram clickable in the cart.</span>
                </span>
                <input name="telegram_enabled" type="checkbox" defaultChecked={settings.telegram_enabled} className="size-5 accent-primary" />
              </label>

              <div className="grid gap-2">
                <label htmlFor="usd_to_khr_rate" className="text-sm font-medium">USD to KHR rate</label>
                <input
                  id="usd_to_khr_rate"
                  name="usd_to_khr_rate"
                  type="number"
                  inputMode="decimal"
                  min="0.0001"
                  step="0.0001"
                  defaultValue={settings.usd_to_khr_rate}
                  required
                  className="h-11 rounded-md border border-input bg-background px-3 text-base"
                />
                <p className="text-xs text-muted-foreground">Defaults to 4000 KHR per USD and must remain positive.</p>
              </div>

              {settingsState.message && (
                <p
                  role={settingsState.status === "error" ? "alert" : "status"}
                  className={`rounded-md px-3 py-2 text-sm ${
                    settingsState.status === "error" ? "bg-destructive/10 text-destructive" : "bg-success/15 text-success"
                  }`}
                >
                  {settingsState.message}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={settingsPending} className="min-h-11 flex-1 rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">
                  {settingsPending ? "Saving…" : "Save settings"}
                </button>
                {settings.telegram_enabled && telegramUsername && (
                  <a
                    href={`https://t.me/${encodeURIComponent(telegramUsername)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
                  >
                    Test <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            </form>
          </div>
        </section>

        <section aria-labelledby="orders-heading" className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <PackageCheck className="size-5 text-primary" />
              <div>
                <h2 id="orders-heading" className="font-heading text-2xl font-semibold">Orders</h2>
                <p className="text-sm text-muted-foreground">{orders.length} most recent matching orders</p>
              </div>
            </div>
            <div className="grid gap-1">
              <label htmlFor="order-status" className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                id="order-status"
                value={selectedStatus}
                onChange={(event) => {
                  const value = event.target.value;
                  router.push(value === "all" ? "/admin" : `/admin?status=${value}`);
                }}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm capitalize"
              >
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {orders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-border p-10 text-center">
              <PackageCheck className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No orders found</p>
              <p className="mt-1 text-sm text-muted-foreground">New storefront orders will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
