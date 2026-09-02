import type { Product } from "@/lib/types/product";

const PAGE_SIZE = 12;

export type Category = {
  id: string;
  name: string;
  slug: string;
};

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price_usd_cents: number;
  price_khr: number | null;
  stock: number;
  image_url: string | null;
};

function toProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price_usd_cents / 100,
    imageUrl: product.image_url,
    badges: product.stock > 0 ? ["In stock"] : ["Sold out"],
    slug: product.slug,
    sku: product.sku,
    stock: product.stock,
    priceKhr: product.price_khr,
  };
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`/api/backend${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getProducts(offset = 0, category?: string): Promise<Product[]> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
  if (category && category !== "all") params.set("category", category);

  const products = await request<ApiProduct[]>(`/products?${params.toString()}`);
  return products.map(toProduct);
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export { PAGE_SIZE };
