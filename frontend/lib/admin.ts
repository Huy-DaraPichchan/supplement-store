import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Order, OrderStatus } from "@/lib/types/order";

export const ADMIN_SESSION_COOKIE = "vista-admin-session";

export type AdminSettings = {
  telegram_username: string | null;
  telegram_enabled: boolean;
  usd_to_khr_rate: string | number;
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

  const response = await fetch(backendUrl(path), {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (response.status === 401) redirect("/admin/login?expired=1");
  if (!response.ok) {
    throw new AdminApiError(await errorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

export async function getAdminSettings() {
  return adminRequest<AdminSettings>("/admin/settings");
}

export async function getAdminOrders(status?: OrderStatus) {
  const query = status ? `?status=${status}&limit=100` : "?limit=100";
  return adminRequest<Order[]>(`/admin/orders${query}`);
}
