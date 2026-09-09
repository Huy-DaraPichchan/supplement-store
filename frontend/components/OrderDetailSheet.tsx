"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Order, OrderStatus } from "@/lib/types/order";
import { Package } from "lucide-react";
import Image from "next/image";

export const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Phnom_Penh",
  }).format(new Date(value));
}

export function formatOrderTotal(order: Order) {
  const usd = `$${(order.total_usd_cents / 100).toFixed(2)}`;
  const khr = `៛${order.total_khr.toLocaleString()}`;
  return order.display_currency === "KHR"
    ? { primary: khr, secondary: usd }
    : { primary: usd, secondary: khr };
}

function formatMoney(order: Order, usdCents: number, khr: number) {
  return order.display_currency === "KHR" ? `៛${khr.toLocaleString()}` : `$${(usdCents / 100).toFixed(2)}`;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const className =
    status === "cancelled"
      ? "bg-destructive/10 text-destructive"
      : status === "completed"
        ? "bg-success/15 text-success"
        : status === "confirmed"
          ? "bg-primary-soft text-primary"
          : "bg-warm-accent-soft text-warning";
  return <Badge variant="outline" className={`capitalize ${className}`}>{status}</Badge>;
}

export default function OrderDetailSheet({
  order,
  open,
  onOpenChange,
  onStatusChange,
  pending,
  message,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (order: Order, status: OrderStatus) => void;
  pending: boolean;
  message: { type: "success" | "error"; text: string } | null;
}) {
  const total = order ? formatOrderTotal(order) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl!">
        {order && total && (
          <>
            <SheetHeader className="border-b border-border px-5 py-5 pr-14">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-xl">{order.order_number}</SheetTitle>
                <OrderStatusBadge status={order.status} />
              </div>
              <SheetDescription>{formatDate(order.created_at)}</SheetDescription>
            </SheetHeader>

            <div className="grid gap-6 p-5">
              <dl className="grid gap-4 rounded-lg bg-muted p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Contact channel</dt><dd className="mt-1 font-medium capitalize">{order.selected_channels.replaceAll(",", ", ")}</dd></div>
                <div><dt className="text-muted-foreground">Display currency</dt><dd className="mt-1 font-medium">{order.display_currency}</dd></div>
                <div><dt className="text-muted-foreground">Created</dt><dd className="mt-1 font-medium">{formatDate(order.created_at)}</dd></div>
                <div><dt className="text-muted-foreground">Exchange rate</dt><dd className="mt-1 font-medium">៛{Number(order.exchange_rate).toLocaleString()} per USD</dd></div>
              </dl>

              <div>
                <h3 className="font-medium">Products</h3>
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
                        <p className="mt-2 text-sm text-muted-foreground">{item.quantity} × {formatMoney(order, item.unit_price_usd_cents, item.unit_price_khr)}</p>
                      </div>
                      <p className="shrink-0 font-semibold">{formatMoney(order, item.line_total_usd_cents, item.line_total_khr)}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-baseline justify-between gap-4 text-lg">
                <span>Total</span>
                <span className="text-right"><strong>{total.primary}</strong> <small className="text-sm font-normal text-muted-foreground">/ {total.secondary}</small></span>
              </div>

              {nextStatuses[order.status].length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-border pt-5">
                  {nextStatuses[order.status].map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={status === "cancelled" ? "destructive" : "default"}
                      size="lg"
                      disabled={pending}
                      onClick={() => onStatusChange(order, status)}
                      className="capitalize"
                    >
                      {pending ? "Updating…" : status}
                    </Button>
                  ))}
                </div>
              )}

              {message && (
                <p role={message.type === "error" ? "alert" : "status"} className={`rounded-md px-3 py-2 text-sm ${message.type === "error" ? "bg-destructive/10 text-destructive" : "bg-success/15 text-success"}`}>
                  {message.text}
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
