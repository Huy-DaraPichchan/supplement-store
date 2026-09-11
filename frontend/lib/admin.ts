import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Order, OrderStatus } from "@/lib/types/order";

export const ADMIN_SESSION_COOKIE = "vista-admin-session";

export type AdminSettings = {
  telegram_username: string | null;
  telegram_enabled: boolean;
  messenger_url: string | null;
  messenger_enabled: boolean;
  usd_to_khr_rate: string | number;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  sku_prefix: string | null;
  is_active: boolean;
};

export type AdminProduct = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price_usd_cents: number;
  price_khr: number | null;
  stock: number;
  image_path: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function backendUrl(path: string) {
  const baseUrl = process.env.BACKEND_URL || "http://localhost:8000";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function errorMessage(response: Response) {
  const payload = await response.json().catch(() => null);
  return payload && typeof payload.detail === "string"
    ? payload.detail
    : `Request failed with status ${response.status}`;
}

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(backendUrl("/admin/login"), {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new AdminApiError(await errorMessage(response), response.status);
  }

  return response.json() as Promise<{ access_token: string; token_type: "bearer" }>;
}

export async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) redirect("/admin/login");

  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(backendUrl(path), {
    cache: "no-store",
    ...init,
    headers,
  });

  if (response.status === 401) redirect("/admin/login?expired=1");
  if (!response.ok) {
    throw new AdminApiError(await errorMessage(response), response.status);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export async function getAdminSettings() {
  return adminRequest<AdminSettings>("/admin/settings");
}

export async function getAdminOrders(status?: OrderStatus) {
  const query = status ? `?status=${status}&limit=100` : "?limit=100";
  return adminRequest<Order[]>(`/admin/orders${query}`);
}

export async function getAdminCategories() {
  return adminRequest<AdminCategory[]>("/admin/categories");
}

export async function getAdminProducts({
  search,
  offset = 0,
  limit = 51,
}: {
  search?: string;
  offset?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  if (search?.trim()) params.set("search", search.trim());
  return adminRequest<AdminProduct[]>(`/admin/products?${params.toString()}`);
}
