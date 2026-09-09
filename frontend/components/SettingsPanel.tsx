"use client";

import { updateOrderingSettingsAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminSettings } from "@/lib/admin";
import { ExternalLink, MessageCircle } from "lucide-react";
import { useActionState } from "react";

export default function SettingsPanel({ settings }: { settings: AdminSettings }) {
  const [state, action, pending] = useActionState(updateOrderingSettingsAction, { status: "idle" as const });
  const telegramUsername = settings.telegram_username?.replace(/^@/, "") || "";

  return (
    <section aria-labelledby="ordering-settings" className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary"><MessageCircle className="size-5" /></span>
        <div>
          <h2 id="ordering-settings" className="font-heading text-3xl font-semibold">Ordering settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">Configure the customer handoff and exchange rate.</p>
        </div>
      </div>

      <form action={action} className="mt-6 grid gap-6 rounded-lg border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="grid gap-2">
          <label htmlFor="telegram_username" className="text-sm font-medium">Telegram username</label>
          <div className="flex h-11 overflow-hidden rounded-md border border-input bg-background">
            <span className="flex items-center border-r border-border px-3 text-muted-foreground">@</span>
            <Input id="telegram_username" name="telegram_username" defaultValue={telegramUsername} placeholder="seller_username" autoComplete="off" className="h-full rounded-none border-0 shadow-none" />
          </div>
          <p className="text-xs text-muted-foreground">Enter the username only, not a Telegram link.</p>
        </div>

        <label className="flex min-h-14 items-center justify-between gap-4 rounded-md border border-border px-4 py-2">
          <span><span className="block text-sm font-medium">Enable Telegram ordering</span><span className="block text-xs text-muted-foreground">Makes Telegram clickable in the cart.</span></span>
          <input name="telegram_enabled" type="checkbox" defaultChecked={settings.telegram_enabled} className="size-5 accent-primary" />
        </label>

        <div className="grid gap-2">
          <label htmlFor="usd_to_khr_rate" className="text-sm font-medium">USD to KHR rate</label>
          <Input id="usd_to_khr_rate" name="usd_to_khr_rate" type="number" inputMode="decimal" min="0.0001" step="0.0001" defaultValue={settings.usd_to_khr_rate} required className="h-11" />
          <p className="text-xs text-muted-foreground">Defaults to 4000 KHR per USD and must remain positive.</p>
        </div>

        {state.message && (
          <p role={state.status === "error" ? "alert" : "status"} className={`rounded-md px-3 py-2 text-sm ${state.status === "error" ? "bg-destructive/10 text-destructive" : "bg-success/15 text-success"}`}>
            {state.message}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="lg" disabled={pending} className="min-w-36">{pending ? "Saving…" : "Save settings"}</Button>
          {settings.telegram_enabled && telegramUsername && (
            <Button render={<a href={`https://t.me/${encodeURIComponent(telegramUsername)}`} target="_blank" rel="noreferrer" />} variant="outline" size="lg">
              Test Telegram <ExternalLink />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
