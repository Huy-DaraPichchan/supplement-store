import AdminOverview from "@/components/AdminOverview";
import { getAdminOrders } from "@/lib/admin";

export default async function AdminOverviewPage() {
  const orders = await getAdminOrders();
  return <AdminOverview orders={orders} />;
}
