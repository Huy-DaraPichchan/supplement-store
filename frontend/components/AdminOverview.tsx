import type { Order, OrderStatus } from "@/lib/types/order";
import { CheckCircle2, CircleDashed, ClipboardList, PackageCheck, XCircle } from "lucide-react";
import Link from "next/link";

const cards: Array<{
  key: "total" | OrderStatus;
  label: string;
  description: string;
  icon: typeof ClipboardList;
}> = [
  { key: "total", label: "Total", description: "Recent orders", icon: ClipboardList },
  { key: "pending", label: "Pending", description: "Awaiting confirmation", icon: CircleDashed },
  { key: "confirmed", label: "Confirmed", description: "Ready to fulfill", icon: PackageCheck },
  { key: "completed", label: "Completed", description: "Fulfilled orders", icon: CheckCircle2 },
  { key: "cancelled", label: "Cancelled", description: "Stopped orders", icon: XCircle },
];

export default function AdminOverview({ orders }: { orders: Order[] }) {
  const counts = orders.reduce<Record<OrderStatus, number>>(
    (result, order) => ({ ...result, [order.status]: result[order.status] + 1 }),
    { pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
  );

  return (
    <section aria-labelledby="overview-heading" className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-medium text-primary">Latest activity</p>
        <h2 id="overview-heading" className="mt-1 font-heading text-3xl font-semibold">Order overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">Counts across the latest {orders.length} of up to 100 orders.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          const value = card.key === "total" ? orders.length : counts[card.key];
          const href = card.key === "total" ? "/admin/orders" : `/admin/orders?status=${card.key}`;
          return (
            <Link
              key={card.key}
              href={href}
              className="group rounded-lg border border-border bg-card p-5 shadow-card transition-[border-color,transform] hover:-translate-y-0.5 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
