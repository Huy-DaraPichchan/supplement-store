"use server";

import {
  ADMIN_SESSION_COOKIE,
  AdminApiError,
  adminRequest,
  loginAdmin,
} from "@/lib/admin";
import type { AdminCategory, AdminProduct } from "@/lib/admin";
import type { OrderStatus } from "@/lib/types/order";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function actionError(error: unknown, fallback: string): AdminActionState {
  return {
    status: "error",
    message: error instanceof AdminApiError ? error.message : fallback,
  };
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function categoryPayload(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  if (!name) return { error: "Enter a category name." };
  if (!slugPattern.test(slug)) {
    return { error: "Use lowercase letters, numbers, and single hyphens for the slug." };
  }
  return {
    payload: {
      name,
      slug,
      is_active: formData.get("is_active") === "on",
    },
  };
}

function productPayload(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const sku = String(formData.get("sku") || "").trim().toUpperCase();
  const price = String(formData.get("price_usd") || "").trim();
  const stock = String(formData.get("stock") || "").trim();
  const categoryId = String(formData.get("category_id") || "");
  if (!name || !sku) return { error: "Enter a product name and SKU." };
  if (!slugPattern.test(slug)) {
    return { error: "Use lowercase letters, numbers, and single hyphens for the slug." };
  }
  if (!/^\d+(?:\.\d{1,2})?$/.test(price)) {
    return { error: "Enter a valid USD price with up to two decimal places." };
  }
  if (!/^\d+$/.test(stock)) return { error: "Stock must be a whole number of zero or more." };

  return {
    payload: {
      category_id: categoryId && categoryId !== "uncategorized" ? categoryId : null,
      name,
      slug,
      sku,
      description: String(formData.get("description") || "").trim(),
      price_usd_cents: Math.round(Number(price) * 100),
      stock: Number(stock),
      is_active: formData.get("is_active") === "on",
    },
  };
}

export async function loginAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { status: "error", message: "Enter your email and password." };
  }

  try {
    const session = await loginAdmin(email, password);
    (await cookies()).set(ADMIN_SESSION_COOKIE, session.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  } catch (error) {
    return actionError(error, "Unable to sign in. Please try again.");
  }

  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

export async function updateOrderingSettingsAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const username = String(formData.get("telegram_username") || "")
    .trim()
    .replace(/^@/, "");
  const telegramEnabled = formData.get("telegram_enabled") === "on";
  const messengerUrl = String(formData.get("messenger_url") || "").trim();
  const messengerEnabled = formData.get("messenger_enabled") === "on";
  const rateInput = String(formData.get("usd_to_khr_rate") || "").trim();

  if (telegramEnabled && !username) {
    return { status: "error", message: "Enter a Telegram username before enabling it." };
  }
  if (username && (username.includes("/") || /\s/.test(username))) {
    return { status: "error", message: "Enter only the Telegram username, without a link or spaces." };
  }
  if (messengerEnabled && !messengerUrl) {
    return { status: "error", message: "Enter a Messenger link before enabling it." };
  }

  if (!rateInput) {
    return { status: "error", message: "Enter the USD to KHR exchange rate." };
  }
  const rate = Number(rateInput);
  if (!Number.isFinite(rate) || rate <= 0) {
    return { status: "error", message: "The USD to KHR rate must be a positive number." };
  }

  try {
    await adminRequest("/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({
        telegram_username: username || null,
        telegram_enabled: telegramEnabled,
        messenger_url: messengerUrl || null,
        messenger_enabled: messengerEnabled,
        usd_to_khr_rate: rate,
      }),
    });
    revalidatePath("/admin");
    return { status: "success", message: "Ordering settings saved." };
  } catch (error) {
    unstable_rethrow(error);
    return actionError(error, "Unable to save ordering settings.");
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
): Promise<AdminActionState> {
  try {
    await adminRequest(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    revalidatePath("/admin");
    return { status: "success", message: `Order marked ${status}.` };
  } catch (error) {
    unstable_rethrow(error);
    return actionError(error, "Unable to update the order.");
  }
}

export async function createCategoryAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = categoryPayload(formData);
  if (result.error) return { status: "error", message: result.error };
  try {
    await adminRequest<AdminCategory>("/admin/categories", {
      method: "POST",
      body: JSON.stringify(result.payload),
    });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { status: "success", message: "Category created." };
  } catch (error) {
    unstable_rethrow(error);
    return actionError(error, "Unable to create the category.");
  }
}

export async function updateCategoryAction(
  categoryId: string,
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = categoryPayload(formData);
  if (result.error) return { status: "error", message: result.error };
  try {
    await adminRequest<AdminCategory>(`/admin/categories/${encodeURIComponent(categoryId)}`, {
      method: "PATCH",
      body: JSON.stringify(result.payload),
    });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { status: "success", message: "Category updated." };
  } catch (error) {
    unstable_rethrow(error);
    return actionError(error, "Unable to update the category.");
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<AdminActionState> {
  try {
    await adminRequest(`/admin/categories/${encodeURIComponent(categoryId)}`, { method: "DELETE" });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { status: "success", message: "Category deleted." };
  } catch (error) {
    unstable_rethrow(error);
    return actionError(error, "Unable to delete the category.");
  }
}

export async function createProductAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = productPayload(formData);
  if (result.error) return { status: "error", message: result.error };
  try {
    await adminRequest<AdminProduct>("/admin/products", {
      method: "POST",
      body: JSON.stringify(result.payload),
    });
    revalidatePath("/admin/products");
    return { status: "success", message: "Product created." };
  } catch (error) {
    unstable_rethrow(error);
    return actionError(error, "Unable to create the product.");
  }
}

export async function updateProductAction(
  productId: string,
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = productPayload(formData);
  if (result.error) return { status: "error", message: result.error };
  try {
    await adminRequest<AdminProduct>(`/admin/products/${encodeURIComponent(productId)}`, {
      method: "PATCH",
      body: JSON.stringify(result.payload),
    });
    revalidatePath("/admin/products");
    return { status: "success", message: "Product updated." };
  } catch (error) {
    unstable_rethrow(error);
    return actionError(error, "Unable to update the product.");
  }
}

export async function deleteProductAction(productId: string): Promise<AdminActionState> {
  try {
    await adminRequest(`/admin/products/${encodeURIComponent(productId)}`, { method: "DELETE" });
    revalidatePath("/admin/products");
    return { status: "success", message: "Product deleted." };
  } catch (error) {
    unstable_rethrow(error);
    return actionError(error, "Unable to delete the product.");
  }
}
