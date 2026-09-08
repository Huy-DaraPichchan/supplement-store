"use server";

import {
  ADMIN_SESSION_COOKIE,
  AdminApiError,
  adminRequest,
  loginAdmin,
} from "@/lib/admin";
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
  const rateInput = String(formData.get("usd_to_khr_rate") || "").trim();

  if (telegramEnabled && !username) {
    return { status: "error", message: "Enter a Telegram username before enabling it." };
  }
  if (username && (username.includes("/") || /\s/.test(username))) {
    return { status: "error", message: "Enter only the Telegram username, without a link or spaces." };
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
