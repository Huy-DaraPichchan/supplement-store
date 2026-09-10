import ProductManagement from "@/components/ProductManagement";
import { getAdminCategories, getAdminProducts } from "@/lib/admin";

const PAGE_SIZE = 50;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const requestedPage = Number.parseInt(params.page || "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [categories, productResults] = await Promise.all([
    getAdminCategories(),
    getAdminProducts({ search: query, offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE + 1 }),
  ]);

  return (
    <ProductManagement
      products={productResults.slice(0, PAGE_SIZE)}
      categories={categories}
      query={query}
      page={page}
      hasNext={productResults.length > PAGE_SIZE}
    />
  );
}
