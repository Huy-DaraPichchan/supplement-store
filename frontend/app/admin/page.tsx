import AdminDashboard from "@/components/AdminDashboard";
import { getAdminOrders, getAdminSettings } from "@/lib/admin";
import type { OrderStatus } from "@/lib/types/order";

const validStatuses = new Set<OrderStatus>([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const requestedStatus = (await searchParams).status;
  const status = validStatuses.has(requestedStatus as OrderStatus)
    ? (requestedStatus as OrderStatus)
    : undefined;
  const [settings, orders] = await Promise.all([
    getAdminSettings(),
    getAdminOrders(status),
  ]);

  return (
    <AdminDashboard
      settings={settings}
      orders={orders}
      selectedStatus={status || "all"}
    />
  );
}
