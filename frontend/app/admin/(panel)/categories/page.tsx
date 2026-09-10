import CategoryManagement from "@/components/CategoryManagement";
import { getAdminCategories } from "@/lib/admin";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return <CategoryManagement categories={categories} />;
}
