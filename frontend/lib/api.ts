import type { Product } from "@/lib/types/product";

const PAGE_SIZE = 12;

export type ProductSort = "newest" | "price_asc" | "price_desc";
export type Currency = "USD" | "KHR";
export type CheckoutChannel = "telegram" | "messenger";

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

export type ProductQuery = {
  offset?: number;
  category?: string;
  search?: string;
  sort?: ProductSort;
  inStock?: boolean;
};

export type BusinessSettings = {
  company_name: string;
  company_summary: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string | null;
  telegram_username: string | null;
  messenger_url: string | null;
  telegram_enabled: boolean;
  messenger_enabled: boolean;
  usd_to_khr_rate: number | null;
  default_currency: Currency;
};

type CheckoutPayload = {
  items: Array<{ product_id: string; quantity: number }>;
  display_currency: Currency;
  channels: CheckoutChannel[];
};

export type CheckoutResponse = {
  order_number: string;
  public_token: string;
  total_usd_cents: number;
  total_khr: number | null;
  display_currency: Currency;
  preferred_channel: CheckoutChannel;
  preferred_url: string;
  fallback_url: string | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = payload && typeof payload.detail === "string" ? payload.detail : null;
    throw new ApiError(detail || `Request failed with status ${response.status}`, response.status);
  }
  return response.json() as Promise<T>;
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(query.offset ?? 0),
    sort: query.sort ?? "newest",
  });
  if (query.category && query.category !== "all") params.set("category", query.category);
  if (query.search?.trim()) params.set("q", query.search.trim());
  if (query.inStock) params.set("in_stock", "true");

  const products = await request<ApiProduct[]>(`/products?${params.toString()}`);
  return products.map(toProduct);
}

export async function getProduct(slug: string): Promise<Product> {
  return toProduct(await request<ApiProduct>(`/products/${encodeURIComponent(slug)}`));
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  return request<BusinessSettings>("/settings");
}

export async function createOrder(payload: CheckoutPayload): Promise<CheckoutResponse> {
  return request<CheckoutResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export { PAGE_SIZE };
