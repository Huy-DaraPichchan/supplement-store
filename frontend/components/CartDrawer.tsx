"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  ApiError,
  createOrder,
  getBusinessSettings,
  type BusinessSettings,
  type CheckoutChannel,
  type Currency,
} from "@/lib/api";
import { MessageCircle, Minus, Plus, Send, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";

export default function CartDrawer() {
  const { items, cartCount, totalUsd, totalKhr, setQuantity, removeFromCart, clearCart } =
    useCart();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [submittingChannel, setSubmittingChannel] = useState<CheckoutChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const checkoutStarted = useRef(false);

  useEffect(() => {
    if (!open || settings) return;
    let cancelled = false;
    getBusinessSettings()
      .then((nextSettings) => {
        if (cancelled) return;
        setSettings(nextSettings);
        if (nextSettings.default_currency === "KHR") {
          setCurrency("KHR");
        }
        setSettingsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setSettingsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, settings]);

  async function handleCheckout(channel: CheckoutChannel) {
    const channelAvailable = channel === "telegram" ? telegramAvailable : messengerAvailable;
    if (!channelAvailable || items.length === 0 || checkoutStarted.current) return;
    checkoutStarted.current = true;
    setSubmittingChannel(channel);
    setError(null);
    try {
      const order = await createOrder({
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        display_currency: currency,
        channels: [channel],
      });
      clearCart();
      window.location.assign(channel === "telegram" ? order.preferred_url : order.public_url);
    } catch (checkoutError) {
      checkoutStarted.current = false;
      setError(
        checkoutError instanceof ApiError
          ? checkoutError.message
          : "The order could not be created. Please try again.",
      );
    } finally {
      setSubmittingChannel(null);
    }
  }

  const telegramAvailable = Boolean(
    settings?.telegram_enabled && settings.telegram_username?.trim(),
  );
  const messengerAvailable = Boolean(
    settings?.messenger_enabled && settings.messenger_url?.trim(),
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          checkoutStarted.current = false;
          setError(null);
        }
      }}
    >
      <Dialog.Trigger
        aria-label={`Shopping cart with ${cartCount} items`}
        className="relative flex size-11 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-[color,background-color,border-color,box-shadow] duration-150 hover:border-primary/20 hover:bg-primary-soft hover:text-primary hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:size-10"
      >
        <ShoppingBag className="size-5" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-foreground/30 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Dialog.Popup className="fixed inset-0 z-50 flex h-dvh w-full translate-x-0 flex-col bg-background text-foreground shadow-panel transition-transform duration-200 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full sm:inset-y-0 sm:left-auto sm:right-0 sm:max-w-md sm:border-l sm:border-border">
          <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-border px-4 pt-[env(safe-area-inset-top)] sm:px-5 sm:pt-0">
            <div>
              <Dialog.Title className="text-lg font-semibold">Your cart</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </Dialog.Description>
            </div>
            <Dialog.Close className="flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
              <X className="size-5" />
              <span className="sr-only">Close cart</span>
            </Dialog.Close>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-5 pb-[env(safe-area-inset-bottom)] text-center sm:px-6">
              <ShoppingBag className="size-10 text-muted-foreground" />
              <h2 className="mt-4 font-semibold">Your cart is empty</h2>
              <p className="mt-1 text-base text-muted-foreground">
                Add a few essentials and they will appear here.
              </p>
              <Dialog.Close
                nativeButton={false}
                render={<Link href="/products" />}
                className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Browse products
              </Dialog.Close>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
                <ul className="divide-y divide-border">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex gap-3 py-4 first:pt-0">
                      <div className="relative size-18 shrink-0 overflow-hidden rounded-lg border border-border bg-muted shadow-card sm:size-20">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt="" fill sizes="80px" className="object-contain p-2" />
                        ) : (
                          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-base font-medium">{product.name}</p>
                        <p className="mt-1 text-base font-semibold">${product.price.toFixed(2)}</p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center rounded-md border border-border">
                            <button type="button" onClick={() => setQuantity(product.id, quantity - 1)} className="flex size-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={`Decrease ${product.name} quantity`}>
                              <Minus className="size-3.5" />
                            </button>
                            <span className="flex h-11 min-w-8 items-center justify-center text-base tabular-nums">{quantity}</span>
                            <button type="button" disabled={quantity >= product.stock} onClick={() => setQuantity(product.id, quantity + 1)} className="flex size-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Increase ${product.name} quantity`}>
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <button type="button" onClick={() => removeFromCart(product.id)} className="flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove ${product.name} from cart`}>
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="max-h-[55dvh] shrink-0 overflow-y-auto border-t border-border bg-card px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-card sm:p-5">
                <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <strong>{currency === "KHR" ? `៛${totalKhr.toLocaleString()}` : `$${totalUsd.toFixed(2)}`}</strong>
                </div>

                {settings && (
                  <div className="mt-4 grid grid-cols-2 gap-2" aria-label="Display currency">
                    {(["USD", "KHR"] as Currency[]).map((option) => (
                      <button key={option} type="button" onClick={() => setCurrency(option)} className={`h-11 rounded-md border text-base transition-colors ${currency === option ? "border-primary bg-primary-soft text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                <fieldset className="mt-4">
                  <legend className="mb-2 text-sm font-medium text-muted-foreground">Contact seller via</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={!telegramAvailable || submittingChannel !== null}
                      onClick={() => void handleCheckout("telegram")}
                      className="flex min-h-14 flex-col items-center justify-center rounded-md bg-primary px-2 text-sm font-semibold text-primary-foreground shadow-card transition-[background-color,box-shadow] hover:bg-primary-hover hover:shadow-raised disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                    >
                      <span className="flex items-center gap-2"><Send className="size-4" /> Telegram</span>
                      <span className="mt-0.5 text-xs font-normal opacity-80">
                        {submittingChannel === "telegram" ? "Creating order…" : telegramAvailable ? "Create order & open" : settingsLoaded ? "Not configured" : "Checking…"}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={!messengerAvailable || submittingChannel !== null}
                      onClick={() => void handleCheckout("messenger")}
                      className="flex min-h-14 flex-col items-center justify-center rounded-md border border-border bg-background px-2 text-sm font-semibold text-foreground shadow-card transition-[background-color,border-color,box-shadow] hover:border-primary/25 hover:bg-primary-soft hover:shadow-raised disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                    >
                      <span className="flex items-center gap-2"><MessageCircle className="size-4" /> Messenger</span>
                      <span className="mt-0.5 text-xs font-normal opacity-80">
                        {submittingChannel === "messenger" ? "Creating order…" : messengerAvailable ? "Create order & continue" : settingsLoaded ? "Not configured" : "Checking…"}
                      </span>
                    </button>
                  </div>
                </fieldset>

                {error && <p role="alert" className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              </div>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
