"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

type CopyState = "idle" | "copied" | "error";

export default function OrderMessengerHandoff({
  messengerUrl,
  summary,
}: {
  messengerUrl: string;
  summary: string;
}) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [fallbackText, setFallbackText] = useState("");

  async function copyOrderDetails() {
    const orderUrl = `${window.location.origin}${window.location.pathname}`;
    const details = `${summary}\nOrder details:\n${orderUrl}`;

    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(details);
      setFallbackText("");
      setCopyState("copied");
    } catch {
      setFallbackText(details);
      setCopyState("error");
    }
  }

  return (
    <div className="grid gap-3 rounded-md border border-border bg-muted p-3">
      <p className="text-sm font-medium">Continue in Messenger</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <Button type="button" onClick={() => void copyOrderDetails()}>
          {copyState === "copied" ? <Check /> : <Copy />}
          {copyState === "copied" ? "Copied" : "Copy order details"}
        </Button>
        <Button
          nativeButton={false}
          render={<a href={messengerUrl} target="_blank" rel="noreferrer" />}
          variant="outline"
        >
          Open Messenger <ExternalLink />
        </Button>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Copy the details, open Messenger, then paste and send them to the seller.
      </p>
      {copyState === "error" && (
        <div className="grid gap-2">
          <p role="alert" className="text-xs text-destructive">
            Automatic copying failed. Select and copy the details below.
          </p>
          <textarea
            readOnly
            value={fallbackText}
            onFocus={(event) => event.currentTarget.select()}
            rows={8}
            aria-label="Order details to copy"
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-xs leading-5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}
    </div>
  );
}
