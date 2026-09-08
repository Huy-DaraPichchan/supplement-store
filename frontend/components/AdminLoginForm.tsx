"use client";

import {
  loginAction,
} from "@/app/admin/actions";
import { LogIn } from "lucide-react";
import { useActionState } from "react";

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAction, { status: "idle" as const });

  return (
    <form action={action} className="mt-7 grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-11 rounded-md border border-input bg-background px-3 text-base"
          placeholder="admin@example.com"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 rounded-md border border-input bg-background px-3 text-base"
        />
      </div>
      {state.status === "error" && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        <LogIn className="size-4" />
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
