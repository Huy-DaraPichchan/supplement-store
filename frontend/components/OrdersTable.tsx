"use client";

import { updateOrderStatusAction } from "@/app/admin/actions";
import OrderDetailSheet, { formatDate, formatOrderTotal, nextStatuses, OrderStatusBadge } from "@/components/OrderDetailSheet";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Order, OrderStatus } from "@/lib/types/order";
import { MoreHorizontal, PackageCheck, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

const statuses: Array<"all" | OrderStatus> = ["all", "pending", "confirmed", "completed", "cancelled"];

function searchText(order: Order) {
  return [order.order_number, ...order.items.flatMap((item) => [item.product_name, item.product_sku])].join(" ").toLowerCase();
}

export default function OrdersTable({ orders, selectedStatus }: { orders: Order[]; selectedStatus: "all" | OrderStatus }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOrders = useMemo(
    () => normalizedQuery ? orders.filter((order) => searchText(order).includes(normalizedQuery)) : orders,
    [orders, normalizedQuery],
  );

  function openOrder(orderId: string) {
    setMessage(null);
    setSelectedOrderId(orderId);
  }

  function changeStatus(order: Order, status: OrderStatus) {
    if (status === "cancelled" && !window.confirm(`Cancel ${order.order_number}?`)) return;
    setMessage(null);
    setPendingOrderId(order.id);
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status);
      setMessage({ type: result.status === "success" ? "success" : "error", text: result.message || "" });
      setPendingOrderId(null);
      if (result.status === "success") router.refresh();
    });
  }

  return (
    <section aria-labelledby="orders-heading" className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Order management</p>
          <h2 id="orders-heading" className="mt-1 font-heading text-3xl font-semibold">Orders</h2>
          <p className="mt-2 text-sm text-muted-foreground">Latest {orders.length} matching orders, up to 100.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders, products, or SKU" className="h-10 pl-9" />
          </div>
          <Select
            value={selectedStatus}
            onValueChange={(value) => router.push(value === "all" ? "/admin/orders" : `/admin/orders?status=${value}`)}
          >
            <SelectTrigger className="h-10 w-full capitalize sm:w-40" aria-label="Filter orders by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {message && !selectedOrder && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`mt-4 rounded-md px-3 py-2 text-sm ${message.type === "error" ? "bg-destructive/10 text-destructive" : "bg-success/15 text-success"}`}
        >
          {message.text}
        </p>
      )}

      {visibleOrders.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Order</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="hidden sm:table-cell">Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleOrders.map((order) => {
                const total = formatOrderTotal(order);
                return (
                  <TableRow
                    key={order.id}
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => openOrder(order.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openOrder(order.id);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(order.created_at)}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{order.items.length}</TableCell>
                    <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{total.primary}</span>
                      <span className="block text-xs text-muted-foreground">{total.secondary}</span>
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                      {nextStatuses[order.status].length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`Actions for ${order.order_number}`} />}>
                            <MoreHorizontal />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {nextStatuses[order.status].map((status) => (
                              <DropdownMenuItem
                                key={status}
                                variant={status === "cancelled" ? "destructive" : "default"}
                                disabled={isPending && pendingOrderId === order.id}
                                onClick={() => changeStatus(order, status)}
                                className="capitalize"
                              >
                                Mark {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-border p-12 text-center">
          <PackageCheck className="mx-auto size-9 text-muted-foreground" />
          <p className="mt-3 font-medium">No orders found</p>
          <p className="mt-1 text-sm text-muted-foreground">{query ? "Try another search." : "New storefront orders will appear here."}</p>
        </div>
      )}

      <OrderDetailSheet
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => { if (!open) setSelectedOrderId(null); }}
        onStatusChange={changeStatus}
        pending={isPending && pendingOrderId === selectedOrderId}
        message={message}
      />
    </section>
  );
}
