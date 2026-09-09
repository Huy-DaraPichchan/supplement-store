import OrdersTable from "@/components/OrdersTable";
import { getAdminOrders } from "@/lib/admin";
import type { OrderStatus } from "@/lib/types/order";

const validStatuses = new Set<OrderStatus>(["pending", "confirmed", "completed", "cancelled"]);

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const requestedStatus = (await searchParams).status;
  const status = validStatuses.has(requestedStatus as OrderStatus) ? requestedStatus as OrderStatus : undefined;
  const orders = await getAdminOrders(status);
  return <OrdersTable orders={orders} selectedStatus={status || "all"} />;
}
